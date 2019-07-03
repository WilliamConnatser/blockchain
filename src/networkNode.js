//request-promise package is used to make API calls to other nodes
const rp = require('request-promise');

//Setup basic express server
const express = require('express');
const app = express();
app.use(express.json());

//Generates a unique id
const uuid = require('uuid/v1');

//Get the port the node is running on
//This allows you to spin up multiple nodes on localhost for testing
const port = process.argv[2];

//Generate a random address for this node
const nodeAddress = uuid().split('-').join('');

//Create a new Blockchain object
const Blockchain = require('./blockchain');
const bitcoin = new Blockchain;

//Check if node is alive
app.get('/', (req, res) => {
    res.send(`Your node is alive on ${port} using the address ${nodeAddress}`);
});

//Get the current blockchain object
//Includes pending transactions, the blockchain, and network node addresses
app.get('/blockchain', (req, res) => {
    res.send(bitcoin)
});

//Post a transaction locally to this node only
//This is mainly only used by POST /transaction/broadcast
app.post('/transaction', (req, res) => {
    const newTransaction = req.body;
    if (!bitcoin.pendingTransactions.find(transaction => transaction.transactionId === newTransaction.transactionId))
        var nextBlock = bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.send({
        message: `Transaction will be added to Block # ${nextBlock}`
    })
});

//Post a transaction to all nodes in the network
app.post('/transaction/broadcast', (req, res) => {
    const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(newTransaction);
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: `${networkNodeUrl}/transaction`,
            method: 'POST',
            body: newTransaction,
            json: true
        }

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(_ => {
            res.send('Transaction broadcasted to the network successfully');
        })
})

//Mine a block and broadcast it to the network
app.get('/mine', (req, res) => {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        blockHeight: lastBlock.blockHeight + 1
    }
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const hash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, hash);

    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: {
                newBlock
            },
            json: true
        }

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(_ => {
            const requestOptions = {
                uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
                method: 'POST',
                body: {
                    amount: 12.5,
                    sender: "00",
                    recipient: nodeAddress
                },
                json: true
            }

            return rp(requestOptions);

        }).then(msg => {
            res.send({
                message: "New Block Mined Successfully!",
                data: newBlock
            });
        });
});

//Mainly only used by GET /mine
//When someone mines a new block this endpoint is used to broadcast it to the network
app.post('/receive-new-block', (req, res) => {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock.blockHeight + 1 === newBlock.blockHeight;

    if (correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.send({
            message: 'New block received and accepted',
            newBlock
        });
    } else {
        res.send({
            message: 'New block rejected'
        });
    }

});

//Use another node as a relay to broadcast your node's existence to all nodes they are connected to
//Use the response to hit POST /register-nodes-bulk on this node to connect to all of those nodes locally
app.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;

    const notPresent = !bitcoin.networkNodes.includes(newNodeUrl);
    const differentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if (differentNode && notPresent)
        bitcoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];

    bitcoin.networkNodes.forEach(networkNodeUrl => {

        const requestOptions = {
            uri: `${networkNodeUrl}/register-node`,
            method: 'POST',
            body: {
                newNodeUrl
            },
            json: true
        }

        regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
        .then(data => {

            const bulkRequestOptions = {
                uri: `${newNodeUrl}/register-nodes-bulk`,
                method: 'POST',
                body: {
                    allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]
                },
                json: true
            }

            return rp(bulkRequestOptions);
        })
        .then(_ => {
            res.send('Node registered with network successfully');
        })
});

//Mainly only used by POST /register-and-broadcast-node
//Registers a node locally with your node only
app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const notPresent = !bitcoin.networkNodes.includes(newNodeUrl);
    const differentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if (differentNode && notPresent)
        bitcoin.networkNodes.push(newNodeUrl);

    res.send({
        message: 'New Node Registered Successfully With Node'
    });
});

//Mainly only used by POST /register-and-broadcast-node
//Used as a callback to connect your node to all nodes that they are connected to
app.post('/register-nodes-bulk', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(newNodeUrl => {
        const notPresent = !bitcoin.networkNodes.includes(newNodeUrl);
        const differentNode = bitcoin.currentNodeUrl !== newNodeUrl;
        if (differentNode && notPresent)
            bitcoin.networkNodes.push(newNodeUrl);
    });
    res.send({
        message: 'Bulk Registration Successful'
    });
});

//Requests all node's copy of the blockchain and looks for a longer valid chain
//If one is found then your local copy of the blockchain is replaced
app.get('/consensus', (req, res) => {

    const requestPromises = [];

    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        }

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(blockchains => {
            const currentChainLength = bitcoin.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;

            blockchains.forEach(blockchain => {

                //If there's a longer valid chain
                if (blockchain.chain.length > maxChainLength && bitcoin.chainIsValid(blockchain.chain)) {

                    //Update these variables
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                }
            });

            if (newLongestChain) {

                bitcoin.chain = newLongestChain;
                bitcoin.newPendingTransactions = newPendingTransactions;

                res.send({
                    message: 'The chain was replaced with a valid longer chain',
                    chain: bitcoin.chain
                });
            } else {
                res.send({
                    message: 'The chain was not replaced- a valid longer chain was not found',
                    chain: bitcoin.chain
                });
            }
        });
});

//Get a block from its hash
app.get('/block/:blockHash', (req, res) => {
    const block = bitcoin.getBlock(req.params.blockHash);

    if (block) {
        res.send({
            block
        });
    } else {
        res.send({
            message: 'No block found matching this hash'
        });
    }
});

//Get a transaction from its ID
app.get('/transaction/:transactionId', (req, res) => {
    const data = bitcoin.getTransaction(req.params.transactionId);

    if (data.transaction) {
        res.send({
            ...data
        });
    } else {
        res.send({
            message: 'No transaction found matching this ID'
        });
    }
});

//Get an address' information
app.get('/address/:address', (req, res) => {
    const data = bitcoin.getAddressData(req.params.address);
    res.send({
        ...data
    });
});

app.listen(port, () => console.log(`\n\n \u{1F680} \u{1F680} \u{1F680} API live on http://localhost:${port}`))
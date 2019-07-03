const express = require('express');
const app = express();
app.use(express.json());
const rp = require('request-promise');

//Generates a unique id
const uuid = require('uuid/v1');

//Get the port from the command
const port = process.argv[2];

const nodeAddress = uuid().split('-').join('');

const Blockchain = require('./blockchain');
const bitcoin = new Blockchain;

app.get('/', (req, res) => {
    res.send('hello world');
});

app.get('/blockchain', (req, res) => {
    res.send(bitcoin)
});

app.post('/transaction', (req, res) => {
    const newTransaction = req.body;
    if (!bitcoin.pendingTransactions.find(transaction => transaction.transactionId === newTransaction.transactionId))
        var nextBlock = bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.send({
        message: `Transaction will be added to Block # ${nextBlock}`
    })
});

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

app.get('/transaction/:transactionId', (req, res) => {

});

app.get('/address/:address', (req, res) => {

});

app.listen(port, () => console.log(`\n\n \u{1F680} \u{1F680} \u{1F680} API live on http://localhost:${port}`))
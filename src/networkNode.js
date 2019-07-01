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
    const nextBlock = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);

    res.send(`Block will be added to ${nextBlock}`)
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
    })

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
    bitcoin.createNewTransaction(12.5, "00", nodeAddress);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, hash);

    res.send({
        message: "New Block Mined Successfully!",
        data: newBlock
    });
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
            res.send('Node registered with network successfully')
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

app.listen(port, () => console.log(`\n\n \u{1F680} \u{1F680} \u{1F680} API live on http://localhost:${port}`))
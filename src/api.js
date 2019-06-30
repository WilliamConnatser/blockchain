const express = require('express');
const app = express();
app.use(express.json());
const uuid = require('uuid/v1');

const nodeAddress = uuid().split('-').join('');

const Blockchain = require('./blockchain');
const bitcoin = new Blockchain;

app.get('/', (req,res) => {
    res.send('hello world');
});

app.get('/blockchain',(req,res) => {
    res.send(bitcoin)
});

app.post('/transaction', (req,res) => {
    const nextBlock = bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);

    res.send(`Block will be added to ${nextBlock}`)
});

app.get('/mine',(req,res) => {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        blockHeight: lastBlock.blockHeight + 1
    }
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const hash = bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce);
    bitcoin.createNewTransaction(12.5, "00", nodeAddress);
    const newBlock = bitcoin.createNewBlock(nonce,previousBlockHash,hash);

    res.send({
        message: "New Block Mined Successfully!",
        data: newBlock});
});

app.listen(3000,() => console.log('\n\n \u{1F680} \u{1F680} \u{1F680} API live on http://localhost:3000'))
const sha256 = require('sha256');
const currentNodeUrl = `http://localhost:${process.argv[2]}`;
//Generates a unique id
const uuid = require('uuid/v1');

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];

    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];

    //Create Genesis Block
    this.createNewBlock(1337, '0', '0');
}

//Created a new block
Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    const newBlock = {
        blockHeight: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce, //Proof
        hash, //Hash of transactions
        previousBlockHash
    }

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const newTransaction = {
        amount,
        sender,
        recipient,
        transactionId: uuid().split('-').join('') //Unique transaction ID
    }

    return newTransaction;
}

Blockchain.prototype.addTransactionToPendingTransactions = function (newTransaction) {
    if (!this.pendingTransactions.find(transaction => newTransaction.transactionId === transaction.transactionId))
        this.pendingTransactions.push(newTransaction);
    return this.getLastBlock().blockHeight + 1;
}

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);

    return hash;
}

// Repeatedly hash block until it finds a hash that starts with four 0s
// Use random nonce to generate different hashes
Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (!hash.startsWith('0000')) {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
}

module.exports = Blockchain;
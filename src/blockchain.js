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

Blockchain.prototype.chainIsValid = function (blockchain) {
    let validChain = true;

    for (let i = 1; i < blockchain.length && validChain; i++) {
        const currentBlock = blockchain[i];
        const lastBlock = blockchain[i - 1];
        const blockHash = this.hashBlock(lastBlock.hash, {
            transactions: currentBlock.transactions,
            blockHeight: currentBlock.blockHeight
        }, currentBlock.nonce);

        //Make sure the block hash is valid
        if (!blockHash.startsWith('0000')) validChain = false;
        //Make sure the blocks are chained properly
        if (currentBlock.previousBlockHash !== lastBlock.hash) validChain = false;
    }

    //Validate genesis block
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock.nonce === 1337;
    const correctPreviousBlockHash = genesisBlock.previousBlockHash === '0';
    const correctHash = genesisBlock.hash === '0';
    const correctTransactions = genesisBlock.transactions.length === 0;

    if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

    return validChain;
}

Blockchain.prototype.getBlock = function (blockHash) {
    const matches = this.chain.filter(block => block.hash === blockHash);
    if (matches.length = 0) return null;
    else return matches;
}

module.exports = Blockchain;
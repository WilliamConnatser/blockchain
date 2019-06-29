function Blockchain () {
    this.chain = [];
    this.pendingTransactions = [];
}

//Created a new block
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
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

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    const newTransaction = {
        amount,
        sender,
        recipient
    }

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock().index + 1;
}

module.exports = Blockchain;
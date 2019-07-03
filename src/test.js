const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

/*
    Test hashBlock

*/
// const previousBlockHash = 'ALSKJFSLDFJSD483398U39ADF';
// const currentBlockData = [
//     {
//         amount: 10,
//         sender: 'bob',
//         recipient: 'sally'
//     }
// ]
// const nonce = 100;
// console.log(bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce));

/*
    Test createNewBlock
*/
// console.log(bitcoin.createNewBlock(2389, 'DSKFSH437FD7HSFSDF', 'SKJFHSDKFJH9238'));

/*
    Test createNewTransaction
*/
// bitcoin.createNewBlock(2389, 'DSKFSH437FD7HSFSDF', 'SKJFHSDKFJH9238');
// console.log(bitcoin.createNewTransaction(100, 'ALEXHJ4354543', 'JACKFHSDFH383432'));

/*
    Test proofOfWork
*/
// const previousBlockHash = 'ALSKJFSLDFJSD483398U39ADF';
// const currentBlockData = [
//     {
//         amount: 10,
//         sender: 'bob',
//         recipient: 'sally'
//     }
// ]
// console.log(bitcoin.hashBlock(previousBlockHash,currentBlockData,115381))
// console.log(bitcoin.proofOfWork(previousBlockHash,currentBlockData));

console.log(bitcoin.chainIsValid(JSON.parse(blockchain)))
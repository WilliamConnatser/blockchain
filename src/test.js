const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

bitcoin.createNewBlock(2389, 'DSKFSH437FD7HSFSDF', 'SKJFHSDKFJH9238');

bitcoin.createNewTransaction(100, 'ALEXHJ4354543', 'JACKFHSDFH383432');
bitcoin.createNewTransaction(10, 'ALEXHJ4354543', 'JACKFHSDFH383432');
bitcoin.createNewTransaction(1000, 'ALEXHJ4354543', 'JACKFHSDFH383432');

bitcoin.createNewBlock(89766, 'JHGJHG7866', 'JKGHJHGJKG786876');

bitcoin.createNewTransaction(100, 'ALEXHJ4354543', 'JACKFHSDFH383432');
bitcoin.createNewTransaction(10, 'ALEXHJ4354543', 'JACKFHSDFH383432');
bitcoin.createNewTransaction(1000, 'ALEXHJ4354543', 'JACKFHSDFH383432');

bitcoin.createNewBlock(89766, 'JHGJHG7866', 'JKGHJHGJKG786876');

console.log(bitcoin.chain[2]);
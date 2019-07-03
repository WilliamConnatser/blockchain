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

const blockchain = [
    {
        "blockHeight": 1,
        "timestamp": 1562118631648,
        "transactions": [],
        "nonce": 1337,
        "hash": "0",
        "previousBlockHash": "0"
    },
    {
        "blockHeight": 2,
        "timestamp": 1562118728443,
        "transactions": [],
        "nonce": 115934,
        "hash": "00003dd86678693dd77603586cf4c3f835e753837a4e5d856c3064df1ddbea45",
        "previousBlockHash": "0"
    },
    {
        "blockHeight": 3,
        "timestamp": 1562118729805,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "f0de6e009d3411e99b9337781c7aabb7",
                "transactionId": "2a924f909d3511e99b9337781c7aabb7"
            }
        ],
        "nonce": 115925,
        "hash": "000087dd7a15543d6e89d9959000fccc45351486ee39a025c5b6bb0cec8506bf",
        "previousBlockHash": "00003dd86678693dd77603586cf4c3f835e753837a4e5d856c3064df1ddbea45"
    },
    {
        "blockHeight": 4,
        "timestamp": 1562118754183,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "f0de6e009d3411e99b9337781c7aabb7",
                "transactionId": "2b604df09d3511e99b9337781c7aabb7"
            },
            {
                "amount": 400,
                "sender": "hello",
                "recipient": "goodbye",
                "transactionId": "338ac2309d3511e99b9337781c7aabb7"
            },
            {
                "amount": 400,
                "sender": "hello",
                "recipient": "goodbye",
                "transactionId": "34191f809d3511e99b9337781c7aabb7"
            }
        ],
        "nonce": 18335,
        "hash": "00000de32a1562e3a63939680cf104f4e3f48017f21ff0f128ae6e795f6ea760",
        "previousBlockHash": "000087dd7a15543d6e89d9959000fccc45351486ee39a025c5b6bb0cec8506bf"
    },
    {
        "blockHeight": 5,
        "timestamp": 1562118763995,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "f0de6e009d3411e99b9337781c7aabb7",
                "transactionId": "39e817909d3511e99b9337781c7aabb7"
            }
        ],
        "nonce": 37934,
        "hash": "0000a81bd9df9f1b3d3ba6fcf4cc12fabf96ee44679801e352e3202422cc48bd",
        "previousBlockHash": "00000de32a1562e3a63939680cf104f4e3f48017f21ff0f128ae6e795f6ea760"
    },
    {
        "blockHeight": 6,
        "timestamp": 1562118768358,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "f0de6e009d3411e99b9337781c7aabb7",
                "transactionId": "3fc121c09d3511e99b9337781c7aabb7"
            },
            {
                "amount": 400,
                "sender": "hello",
                "recipient": "goodbye",
                "transactionId": "40b71a809d3511e99b9337781c7aabb7"
            }
        ],
        "nonce": 80356,
        "hash": "0000afb152f4b7e29e7801e41f4301801dde083a83cdbfc8bbe973c37c4ae843",
        "previousBlockHash": "0000a81bd9df9f1b3d3ba6fcf4cc12fabf96ee44679801e352e3202422cc48bd"
    },
    {
        "blockHeight": 7,
        "timestamp": 1562118775555,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "f0de6e009d3411e99b9337781c7aabb7",
                "transactionId": "425b06809d3511e99b9337781c7aabb7"
            },
            {
                "amount": 400,
                "sender": "hello",
                "recipient": "goodbye",
                "transactionId": "4587b5609d3511e99b9337781c7aabb7"
            }
        ],
        "nonce": 13945,
        "hash": "00000c03cd08ea8103102c131070a0cbb3e1f5ca8a9cc214e1ec9f3b316c24ec",
        "previousBlockHash": "0000afb152f4b7e29e7801e41f4301801dde083a83cdbfc8bbe973c37c4ae843"
    },
    {
        "blockHeight": 8,
        "timestamp": 1562118776395,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "f0de6e009d3411e99b9337781c7aabb7",
                "transactionId": "46a533509d3511e99b9337781c7aabb7"
            }
        ],
        "nonce": 52324,
        "hash": "00008ad22b7965639a7d6f5b3420e5607f8584fce588d001f5876f28f66418a8",
        "previousBlockHash": "00000c03cd08ea8103102c131070a0cbb3e1f5ca8a9cc214e1ec9f3b316c24ec"
    }
]

console.log(bitcoin.chainIsValid(JSON.parse(blockchain)))
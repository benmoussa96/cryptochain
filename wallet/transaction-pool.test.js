const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./wallet');

describe('TransactionPool', () => {
    let transactionPool, transaction, wallet;

    beforeEach(() => {
        senderWallet = new Wallet();
        transaction = new Transaction({ senderWallet, recipient: 'fake-recipient', amount: 50 });
        transactionPool = new TransactionPool();
    })
})
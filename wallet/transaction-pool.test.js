const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./wallet');

describe('TransactionPool', () => {
    let transactionPool, transaction;

    beforeEach(() => {
        const senderWallet = new Wallet();
        transaction = new Transaction({ senderWallet, recipient: 'fake-recipient', amount: 50 });
        transactionPool = new TransactionPool();
    });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });
})
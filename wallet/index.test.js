const Wallet = require('./index');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { verifySignature } = require('../util');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'fooBar';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    signature: wallet.sign(data),
                    data
                })
            ).toBe(true);
        });

        it('does not verifie an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    signature: new Wallet().sign(data),
                    data
                })
            ).toBe(false);
        });
    });

    describe('createTransaction()', () => {
        describe('and the amount exceeds the balance', () => {
            it('throws an error', () => {
                expect(
                    () => wallet.createTransaction({ amount: 999999999, recipient: 'recipient-addrees' })
                ).toThrow('Amount exceeds the balance')
            })
        });

        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'recipient-address';
                transaction = wallet.createTransaction({ amount, recipient });
            })

            it('creates and instanceof `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        describe('and a chain is passed', () => {
            it('calls `Wallet.calculateBalance`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 10,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs for the wallet', () => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.pblicKey
                    })
                ).toEqual(STARTING_BALANCE);
            })
        });

        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 49
                });

                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 75
                });

                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });

            it('adds the sum  of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(
                    STARTING_BALANCE +
                    transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]
                );

            });

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'foo-address',
                        amount: 35
                    });

                    blockchain.addBlock({ data: [recentTransaction] });
                });

                it('returns the output amount of the recent transaction', () => {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs with or after the recent transaction', () => {
                    let sameBlockTransation, followingBlockTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-foo-address',
                            amount: 24
                        });

                        sameBlockTransation = Transaction.rewardTransaction({ minerWallet: wallet });

                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransation] });

                        followingBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 80
                        });

                        blockchain.addBlock({ data: [followingBlockTransaction] });
                    });

                    it('includes th output amounts in th returned balance', () => {
                        expect(
                            Wallet.calculateBalance({
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })
                        ).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] +
                            sameBlockTransation.outputMap[wallet.publicKey] +
                            followingBlockTransaction.outputMap[wallet.publicKey]
                        );
                    });
                });
            });
        });
    });
});
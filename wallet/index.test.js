const Wallet = require('./index');
const { verifySignature } = require('../util');

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
});
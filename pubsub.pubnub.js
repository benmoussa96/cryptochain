const PubNub = require('pubnub');

const credentials = {
    publishKey: 'pub-c-c5bc9b1f-3e72-41bf-8953-de3d4a90f0d6',
    subscribeKey: 'sub-c-76ee17b8-5548-4488-a32a-daa396600909',
    secrtKey: 'sec-c-MzE2NTlhODktMzdmMS00OTBmLWFmMWUtMzg4Yjk4MmU4YzNl'
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub {
    constructor({ blockchain, transactionPool }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.pubnub = new PubNub(credentials);

        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

        this.pubnub.addListener(this.listener());
    }

    listener() {
        return {
            message: ({ channel, message }) => {
                console.log('==> Message recieved.');
                console.log(`Channel: ${channel}`);
                console.log(`Message: ${message}`);

                const parsedMessage = JSON.parse(message);

                switch (channel) {
                    case CHANNELS.BLOCKCHAIN:
                        this.blockchain.replaceChain(parsedMessage);
                        break;
                    case CHANNELS.TRANSACTION:
                        console.log(parsedMessage);
                        this.transactionPool.setTransaction(parsedMessage);
                        break;
                    default:
                        return;
                }
            }
        }
    }

    publisher({ channel, message }) {
        this.pubnub.publish({ channel, message });
    }

    broadcastChain() {
        this.publisher({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        this.publisher({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });
    }
}

module.exports = PubSub;
class TransactionMiner {
    construnctor({ blockchain, tranasctionPool, wallet, pubsub }) {
        this.blockchain = blockchain;
        this.tranasctionPool = tranasctionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransaction() {
        // get the transaction pool's valid transactions
        // genrate the miner's reward
        // add a block with these transactions to the blockchain
        // broadcast the updated blockchain
        //  clear the transaction pool
    }
}

module.exports = TransactionMiner;
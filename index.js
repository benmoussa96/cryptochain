const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet')

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get(
    '/api/blocks',
    (req, res) => {
        res.json(blockchain.chain);
    }
);

app.post(
    '/api/mine',
    (req, res) => {
        const { data } = req.body;

        blockchain.addBlock({ data });

        pubsub.broadcastChain();

        res.redirect('/api/blocks');
    }
);

app.post(
    '/api/transact',
    (req, res) => {
        const { amount, recipient } = req.body;

        let transaction;

        try {
            transaction = wallet.createTransaction({ amount, recipient });
        } catch (error) {
            return res.status(400).json({ type: 'error', message: error.message });
        }

        transactionPool.setTransaction(transaction);

        res.json({ type: 'success', transaction });
    }
);

const syncChain = () => {
    request(
        { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
        (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const rootChain = JSON.parse(body);
                blockchain.replaceChain(rootChain);
            }
        }
    );
}

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`Listening at localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncChain();
    }
});

const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

class Miner{
    constructor(blockchain, transactionPool, wallet, p2pServer){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine(){
        const validTransactions = this.transactionPool.validTransactions();
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
        //include a reward for the miner
        //create a block consisting of the valid transactions
        const block = this.blockchain.addBlock(validTransactions);
        //sysnchronise the chains in the peer-to-peer server
        this.p2pServer.syncChains();
        //clear the transaction pool
        this.transactionPool.clear();
        //broadcast to every miner to clear their transaction pools.
        this.p2pServer.broadcastClearTransactions();

        return block;
    }
}


module.exports = Miner;
const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');
const {INITIAL_BALANCE} = require('../config');

class Wallet {
    constructor(){
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet -
            publicKey : ${this.publicKey.toString()}
            balance   : ${this.balance}`;
    }

    sign(dataHash){
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain, transactionPool){

        this.balance = this.calculateBalance(blockchain);

        if(amount> this.balance){
            console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
            return;
        }

        // if a transaction in the pool already has this input, then add this transaction to its outputs
        let transaction = transactionPool.existingTransaction(this.publicKey);

        if(transaction){
            transaction.update(this, recipient, amount);
        }else{
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }

    
    /**
    * The balance is the sum total of output amounts matching their public key
    * !!!after!!! their most recent transaction amount (where they have an input)
    * If they don't have a recent transaction, add the sum total outputs to their current balance
    */
    calculateBalance(blockchain) {
        let balance = this.balance;

        let transactions = [];
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
          transactions.push(transaction);
        }));
    
        const walletInputTs = transactions
          .filter(transaction => transaction.input.address === this.publicKey);
    
        // add all currency they have received after their recent transaction,
        // or the default 0
        let startTime = 0;
        // set the balance to the amount of the most recent sender's transaction
        if (walletInputTs.length > 0) {
          const recentInputT = walletInputTs.reduce(
            (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
          );
          startTime = recentInputT.input.timestamp;
          balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
        }
    
        transactions.forEach(transaction => {
          if (transaction.input.timestamp > startTime) {
            transaction.outputs.forEach(output => {
              if (output.address === this.publicKey) {
                balance += output.amount;
              }
            });
          }
        });
    
        return balance;
      }

    static blockchainWallet(){
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';

        return blockchainWallet;
    }
}

module.exports = Wallet;
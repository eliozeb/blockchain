const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    // Constructor for creating a new block
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash; // Hash of the previous block
        this.hash = hash; // Hash of the current block
        this.data = data; // Data stored in the block
        this.nonce = nonce; // Nonce used in proof-of-work
        this.difficulty = difficulty || DIFFICULTY; // Difficulty level for mining
    }

    // String representation of the block
    toString() {
        return `Block -
        Timestamp  : ${this.timestamp}
        Last Hash  : ${this.lastHash}
        Hash       : ${this.hash}
        Nonce      : ${this.nonce}
        Difficulty : ${this.difficulty}
        Data       : ${JSON.stringify(this.data)}`;
    }

    // Create the genesis block (first block in the chain)
    static genesis() {
        return new this('Genesis Time', '-----', 'f1r57-h45h', [], 0, DIFFICULTY);
    }

    // Mine a new block
    static mineBlock(lastBlock, data) {
        let hash;
        let timestamp;
        const lastHash = lastBlock.hash; // Hash of the previous block
        let { difficulty } = lastBlock; // Current difficulty level
        let nonce = 0;

        do {
            nonce++; // Increment the nonce
            timestamp = Date.now(); // Get the current timestamp
            difficulty = Block.adjustDifficulty(lastBlock, timestamp); // Adjust difficulty dynamically
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty); // Calculate the hash
            
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty)); // Proof-of-work condition

        // Return the newly mined block
        return new this(timestamp, lastHash, hash, data, nonce, difficulty);
    }

    // Generate a hash for a block
    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return ChainUtil.hash(`${timestamp}${lastHash}${JSON.stringify(data)}${nonce}${difficulty}`).toString();
    }

    // Generate a hash for a given block object
    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    // Adjust the difficulty based on the time taken to mine the last block
    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        // If the block was mined too quickly, increase difficulty; otherwise, decrease it
        if (lastBlock.timestamp + MINE_RATE > currentTime) {
            return difficulty + 1;
        }
        return difficulty - 1;
    }
}

module.exports = Block;
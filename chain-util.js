// npm i elliptic --save

const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
// npm i uuid --save
const {v1: uuidV1} = require('uuid');

const ec = new EC('secp256k1');

class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair();
    }

    static id(){
        return uuidV1();
    }

    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature, dataHash){
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
    }
}

module.exports = ChainUtil;
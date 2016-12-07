// web3 global
if(typeof web3 === 'undefined') {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

// ens global
let ENS = require('ethereum-ens');
ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');

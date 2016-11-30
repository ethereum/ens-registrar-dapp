if (!web3) {
  throw 'web3 should have been available before trying to set up ENS helper.'
}

let ENS = require('ethereum-ens');
ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');

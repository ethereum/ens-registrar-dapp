var ENS = require('ethereum-ens');
var Registrar = require('eth-registrar-ens');

ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');
registrar = new Registrar(web3, ens.owner('eth'), 7, 'eth', ens.registry.address);

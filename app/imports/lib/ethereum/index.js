import ENS from 'ethereum-ens';
import Registrar from 'eth-registrar-ens';
import service from '../dependent-service';

export default ethereum = (function() {
  let subscribers = [];

  return {
    init() {
      let services = {};
      if(typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      }
      else {
        let Web3 = require('web3');
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      }
      services.ethereum = service({
        checker: (cb) => cb(null, web3.isConnected())
      })
      services.sync = service({
        checker: (cb) => {
          web3.eth.getSyncing((e, sync) => {
            cb(null, e || !sync);
          });
        },
        dependsOn: services.ethereum
      })
      services.ens = service({
        checker: (cb) => {
          let ok = typeof registrar !== 'undefined' &&
            registrar.ens.owner('eth') == registrar.address;
          cb(null, ok)
        },
        interval: 2000,
        starter: (cb) => {
          ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');
          registrar = new Registrar(web3);
          registrar.init();
          cb();
        },
        dependsOn: services.sync
      })
      services.ethereum.startChecking();
      services.sync.startChecking();
      services.ens.startChecking();
      return services;
    }
  };
}());

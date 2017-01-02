import ENS from 'ethereum-ens';
import Registrar from 'eth-registrar-ens';
import service from '../dependent-service';

export default ethereum = (function() {
  let subscribers = [];

  function getEnsInfo(network) {
    switch(network) {
      case 'ropsten': return {
        address: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
        block: 25409
      };
      default: return false;
    }
  }

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
      //make a service chain
      services.ethereum = service({
        checker: (cb) => cb(null, web3.isConnected())
      })
      services.network = service({
        checker: (cb) => {
          web3.eth.getBlock(0, function(e, res){
            if (e) {
              return cb(e)
            }
            switch(res.hash) {
              case '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d':
                network='ropsten';
                cb(null, true);
                break;
              case '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303':
                network='morden';
                cb(null, false);
                break;
              case '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3':
                network='main';
                cb(null, false);
                break;
              default:
                network='private';
                cb(null, false);
            }
          });
        },
        dependsOn: services.ethereum,
        checkOnce: true
      })
      services.ensBlock = service({
        checker: cb => web3.eth.getBlockNumber((err, block) => {
          let info = getEnsInfo(network);
          if (!info) {
            return cb(null, false);
          }
          cb(null, block > info.block);
        }),
        dependsOn: services.network
      })
      services.ens = service({
        checker: (cb) => {
          let ok = typeof registrar !== 'undefined' &&
            registrar.ens.owner('eth') == registrar.address;
          cb(null, ok)
        },
        starter: (cb) => {
          let info = getEnsInfo(network);
          if (!info) {
            return cb(new Error('ENS not found on network ' + network))
          }
          ens = new ENS(web3, info.address);
          registrar = new Registrar(web3);
          registrar.init();
          cb();
        },
        dependsOn: services.ensBlock,
        checkOnce: true
      })
      return services;
    }

  };
}());

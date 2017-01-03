import ENS from 'ethereum-ens';
import Registrar from 'eth-registrar-ens';

let web3Global = web3;

//These get assigned at init() below
export let web3;
export let ens;
export let registrar;
export let network;

export default ethereum = (function() {
  let subscribers = [];

  function initWeb3() {
    return new Promise((resolve, reject) => {
      if(typeof web3Global !== 'undefined') {
        web3 = new Web3(web3Global.currentProvider);
      }
      else {
        let Web3 = require('web3');
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      }
      resolve();
    })
  }

  function checkConnection() {
    reportStatus('Checking connection...')
    var attempts = 4,
      checkInterval;
    return new Promise((resolve, reject) => {
      function check() {
        attempts--;
        if(web3.isConnected()) {
          clearInterval(checkInterval)
          resolve(web3);
        } else if (attempts <= 0) {
          reportStatus('Ethereum network is disconnected. Awaiting connection...');
        }
      }
      checkInterval = setInterval(check, 800);
      check();
    });
  }
  
  function checkNetwork() {
    return new Promise((resolve, reject) => {
      web3.eth.getBlock(0, function(e, res){
        if (e) {
          return reject(e)
        }
        let rejectMessage = 'Sorry, ENS is only available on the Ropsten testnet' +
          ' network at the moment.'
        switch(res.hash) {
          case '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d':
            network='ropsten';
            resolve();
            break;
          case '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303':
            network='morden';
            reject(rejectMessage);
            break;
          case '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3':
            network='main';
            reject(rejectMessage);
            break;
          default:
            network='private';
            reject(rejectMessage);
        }
      });
    })
  }

  function initRegistrar() {
    reportStatus('Initializing ENS registrar...');
    return new Promise((resolve, reject) => {
      try {
        ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');
        registrar = new Registrar(web3);
        registrar.init();
        let owner = registrar.ens.owner('eth')
        if(owner !== '0xc68de5b43c3d980b0c110a77a5f78d3c4c4d63b4') {
          throw 'Could not find ENS contract. Make sure your node' +
            ' is synced to at least block 25409.';
        }
        resolve();
      } catch(e) {
        reject('Error initialiting ENS registrar: ' + e);
      }
    });
  }

  function reportStatus(description, isReady, theresAnError) {
    console.log(description);
    subscribers.forEach((subscriber) => subscriber({
      isReady,
      description,
      theresAnError
    }));
  }


  return {
    init() {
      reportStatus('Connecting to Ethereum network...');
      return initWeb3()
        .then(checkConnection)
        .then(checkNetwork)
        .then(initRegistrar)
        .then(() => {
          //set a global for easier debugging on the console
          g = {web3, ens, registrar, network};
          reportStatus('Ready', true);
        })
        .catch(err => {
          reportStatus(err, false, true);
        })
    },
    onStatusChange(callback) {
      subscribers.push(callback);
    }
  };
}());

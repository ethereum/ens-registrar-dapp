import ENS from 'ethereum-ens';
import Registrar from 'eth-registrar-ens';

//These get assigned at init() below
export let ens;
export let registrar;
export let network;

export let errors = {
  invalidNetwork: new Error('Sorry, ENS is only available on the Ropsten testnet' +
    ' network at the moment.')
}

export default ethereum = (function() {
  let subscribers = [];
  let customEnsAddress;

  function initWeb3() {
    return new Promise((resolve, reject) => {
      if(typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
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
        switch(res.hash) {
          case '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d':
            network='ropsten';
            resolve();
            break;
          case '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303':
            network='morden';
            reject(errors.invalidNetwork);
            break;
          case '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3':
            network='main';
            reject(errors.invalidNetwork);
            break;
          default:
            network='private';
            reject(errors.invalidNetwork);
        }
      });
    })
  }

  function initRegistrar() {
    reportStatus('Initializing ENS registrar...');
    return new Promise((resolve, reject) => {
      try {
        ens = new ENS(web3, customEnsAddress || '0x112234455c3a32fd11230c42e7bccd4a84e02010');
        registrar = new Registrar(web3, ens);
        if (!customEnsAddress) {
          //Check correct Ropsten ENS contract
          registrar.ens.owner('eth', (err, owner) => {
            if (err) {
              return reject(err);
            }
            console.log('owner: ' + owner);
            if(owner !== '0xc68de5b43c3d980b0c110a77a5f78d3c4c4d63b4') {
              reject('Could not find ENS contract. Make sure your node' +
                ' is synced to at least block 25409.');
            } else {
              resolve();
            }
          })
        }
      } catch(e) {
        reject('Error initialiting ENS registrar: ' + e);
      }
    });
  }
  
  function initEthereumHelpers() {
    return new Promise((resolve, reject) => {
      EthAccounts.init();
      resolve();
    })
  }

  function reportStatus(description, isReady, theresAnError) {
    console.log(description);
    subscribers.forEach((subscriber) => subscriber({
      isReady,
      description,
      theresAnError
    }));
  }
  
  function watchDisconnect() {
    function check() {
      if(web3.isConnected()) {
        setTimeout(check, 2500);
      } else {
        initEthereum();
      }
    }
    
    return new Promise((resolve, reject) => {
      check();
      resolve();
    })
  }
  
  function initEthereum() {
    reportStatus('Connecting to Ethereum network...');
    return initWeb3()
      .then(checkConnection)
      .then(watchDisconnect)
      .then(checkNetwork)
      .catch(err => {
        if (err !== errors.invalidNetwork || !customEnsAddress) {
          throw err;
        }
      })
      .then(initRegistrar)
      .then(initEthereumHelpers)
      .then(() => {
        //set a global for easier debugging on the console
        g = {ens, registrar, network};
        reportStatus('Ready', true);
      })
      .catch(err => {
        reportStatus(err, false, true);
      })
  }

  return {
    init: initEthereum,
    onStatusChange(callback) {
      subscribers.push(callback);
    },
    setCustomContract(ensAddress) {
      customEnsAddress = ensAddress;
    }
  };
}());

import ENS from 'ethereum-ens';
import Registrar from 'eth-registrar-ens';

export default ethereum = (function() {
  let subscribers = [],
    isReady = false;

  function initWeb3() {
    return new Promise((resolve, reject) => {
      if(typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      }
      else {
        let Web3 = require('web3');
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      }
      resolve(web3);
    })
  }

  function checkConnection(web3) {
    reportStatus('Checking connection...')
    var attempts = 4,
      checkInterval;
    return new Promise((resolve, reject) => {
      function check() {
        attempts--;
        if (attempts === 0) {
          reject('Could not connect to Ethereum network');
          clearInterval(checkInterval)
          return;
        }
        if(web3.isConnected()) {
          clearInterval(checkInterval)
          resolve(web3);
        }
      }
      checkInterval = setInterval(check, 800);
      check();
    });
  }

  function checkSyncStatus(web3) {
    reportStatus('Checking sync status...');
    var attempts = 4,
      checkInterval;
    return new Promise((resolve, reject) => {
      function check(onConnect) {
        attempts--;
        if (attempts === 0) {
          reject('Etherum node needs to sync');
          clearInterval(checkInterval)
          return;
        }
        web3.eth.getSyncing(function(e, sync) {
            if(e || !sync) {
              clearInterval(checkInterval)
              resolve(web3);
            }
        })
      }
      checkInterval = setInterval(check, 800);
      check();
    });
  }

  function initRegistrar(web3) {
    reportStatus('Initializing ENS registrar...');
    return new Promise((resolve, reject) => {
      var ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');
      var registrar = new Registrar(web3);
      registrar.init();
      resolve({web3, ens, registrar});
    });
  }

  //todo: instead of globals, create methods or properties
  //for retrieving these objects
  function setGlobals(globals) {
    web3 = globals.web3;
    ens = globals.ens;
    registrar = globals.registrar;
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  function reportStatus(description) {
    subscribers.forEach((subscriber) => subscriber({
      isReady,
      description
    }));
  }


  return {
    init() {
      reportStatus('Connecting to Ethereum network...');
      return initWeb3()
        .then(checkConnection)
//        .then(checkSyncStatus)
        .then(initRegistrar)
        .then(setGlobals)
        .then(() => {
          isReady = true;
          reportStatus('Ready');
        })
        .catch(err => {
          reportStatus(err);
        })
    },
    onStatusChange(callback) {
      subscribers.push(callback);
    }
  };
}());

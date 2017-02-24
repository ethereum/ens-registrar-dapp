import ENS from 'ethereum-ens';
import Registrar from 'eth-registrar-ens';
import initCollections from './collections';

//These get assigned at init() below
export let ens;
export let registrar;
export let network;

export let errors = {
  invalidNetwork: new Error('Sorry, ENS is only available on the Ropsten testnet' +
    ' network at the moment.')
}

let networkId;

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
        networkId = res.hash.slice(2,8);
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
        registrar = new Registrar(web3, ens, 'eth', 7, (err, result) => {
          if (err) {
              return reject(err);
          } else {
            
            if (!customEnsAddress) {
              //Check correct Ropsten ENS contract
              registrar.ens.owner('eth', (err, owner) => {
                if (err) {
                  return reject(err);
                }
                if(owner !== '0xc68de5b43c3d980b0c110a77a5f78d3c4c4d63b4') {
                  reject('Could not find ENS contract. Make sure your node' +
                    ' is synced to at least block 25409.');
                } else {
                  resolve();
                }
              })
            }
          }
        });

      } catch(e) {
        reject('Error initialiting ENS registrar: ' + e);
      }
    });
  }

  function loadNames() {
    (function() {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'preimages.js';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    })();
  }

  window.binarySearchNames = function(searchElement) {
    var minIndex = 0;
    var maxIndex = knownNames.length - 1;
    var currentIndex = (maxIndex + minIndex) / 2 | 0;
    var currentElement;

    if (searchElement.slice(0,2) == "0x" && web3.sha3('').slice(0,2) !== '0x') {
          searchElement = searchElement.slice(2);
    } else if (searchElement.slice(0,2) != "0x" && web3.sha3('').slice(0,2) == '0x') {
          searchElement = '0x' + searchElement;
    }

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = knownNames[currentIndex];

        if (web3.sha3(currentElement) < searchElement) {
            minIndex = currentIndex + 1;
        } else if (web3.sha3(currentElement) > searchElement) {
            maxIndex = currentIndex - 1;
        } else {
            return knownNames[currentIndex];
        }
    }

    return null;
    }

  window.watchEvents = function watchEvents() {
      var lastBlockLooked = LocalStore.get('lastBlockLooked') || 400000;
      lastBlockLooked -= 1000;

      console.log(knownNames.length + ' known names loaded. Now checking for events since block ' + lastBlockLooked);

      return new Promise((resolve, reject) => {
        var AuctionStartedEvent = registrar.contract.AuctionStarted({}, {fromBlock: lastBlockLooked});

        // event HashRegistered(bytes32 indexed hash, address indexed owner, uint value, uint now);
        var HashRegisteredEvent = registrar.contract.HashRegistered({}, {fromBlock: lastBlockLooked});

        AuctionStartedEvent.watch(function(error, result) {
          if (!error) {            
              LocalStore.set('lastBlockLooked', result.blockNumber);
              var hash = result.args.hash.replace('0x','').slice(0,12);
              var name;

              if (Names.findOne({hash: hash})) {
                name = Names.findOne({hash: hash}).name;
                console.log('\n Watched name auction started!', name, result.args.hash);
              } else if(binarySearchNames(result.args.hash)) {
                name = binarySearchNames(result.args.hash);
                console.log('\n Known name auction started!', name, result.args.hash);
              }

              if (name) {
                Names.upsert({name: name}, 
                  { $set: { 
                    fullname: name + '.eth',
                    registrationDate: Number(result.args.auctionExpiryDate.toFixed()),
                    hash: hash,
                    public: true
                  }})
              }
          } 
        });

        HashRegisteredEvent.watch(function(error, result) {
          if (!error) {
              var value = Number(web3.fromWei(result.args.value.toFixed(), 'ether'));
              var hash = result.args.hash.replace('0x','').slice(0,12);
              var name;
              
              LocalStore.set('lastBlockLooked', result.blockNumber);

              if (Names.findOne({hash: hash})) {
                name = Names.findOne({hash: hash}).name;
                console.log('\n Watched name registered!', name, result.args.hash, result.args.now.toFixed());
              } else if(binarySearchNames(result.args.hash)) {
                name = binarySearchNames(result.args.hash);
                console.log('\n Known name registered!', name, result.args.hash, result.args.now.toFixed());
              }
        
              Names.upsert({hash: hash}, 
                { $set: { 
                  name: name,
                  fullname: name ? name + '.eth' : null,
                  registrationDate: Number(result.args.now.toFixed()),
                  value: value,
                  public: name && name.length > 0
                }})                 
          } 
        });      

        resolve(); 
      })
    }  

  function reportStatus(description, isReady, theresAnError) {
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
      .then(() => {
        //set a global for easier debugging on the console
        g = {ens, registrar, network};
        initCollections(networkId);
        loadNames();
        reportStatus('Ready!', true);
      })
      .catch(err => {
        console.error(err);
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

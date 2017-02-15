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
        registrar = new Registrar(web3, ens, 'eth', 7, (err, result) => {
          console.log('new Registrar', err, result);
          if (err) {
              return reject(err);
          } else {
            
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
          }
        });

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

  function watchEvents() {
    var lastBlockLooked = LocalStore.get('lastBlockLooked') - 1000 || 400000;
    console.log( 'lastBlockLooked', lastBlockLooked);

    if (LocalStore.get('AverageValue') === 'undefined' || LocalStore.get('AverageValue') === 'NaN')
        LocalStore.set('AverageValue', 1 );

    return new Promise((resolve, reject) => {
      console.log('watchEvents');
      var AuctionStartedEvent = registrar.contract.AuctionStarted({}, {fromBlock: lastBlockLooked});

      // event HashRegistered(bytes32 indexed hash, address indexed owner, uint value, uint now);
      var HashRegisteredEvent = registrar.contract.HashRegistered({}, {fromBlock: lastBlockLooked});


      var dummyWords = ['ethereum','foundation','vandesande','vitalik', 'metamask', 'blockstream', 'appcatalog', 'unitedstatesofamerica','afghanistan','albania','algeria','andorra','angola','antigua&deps','argentina','armenia','australia','austria','azerbaijan','bahamas','bahrain','bangladesh','barbados','belarus','belgium','belize','benin','bhutan','bolivia','bosniaherzegovina','botswana','brazil','brunei','bulgaria','burkina','burma','burundi','cambodia','cameroon','canada','capeverde','centralafricanrep','chad','chile','peoplesrepublicofchina','republicofchina','colombia','comoros','democraticrepublicofthecongo','republicofthecongo','costarica','','croatia','cuba','cyprus','czechrepublic','danzig','denmark','djibouti','dominica','dominicanrepublic','easttimor','ecuador','egypt','elsalvador','equatorialguinea','eritrea','estonia','ethiopia','fiji','finland','france','gabon','gazastrip','thegambia','georgia','germany','ghana','greece','grenada','guatemala','guinea','guinea-bissau','guyana','haiti','holyromanempire','honduras','hungary','iceland','india','indonesia','iran','iraq','republicofireland','israel','italy','ivorycoast','jamaica','japan','jonathanland','jordan','kazakhstan','kenya','kiribati','northkorea','southkorea','kosovo','kuwait','kyrgyzstan','laos','latvia','lebanon','lesotho','liberia','libya','liechtenstein','lithuania','luxembourg','macedonia','madagascar','malawi','malaysia','maldives','mali','malta','marshallislands','mauritania','mauritius','mexico','micronesia','moldova','monaco','mongolia','montenegro','morocco','mountathos','mozambique','namibia','nauru','nepal','newfoundland','netherlands','newzealand','nicaragua','niger','nigeria','norway','oman','ottomanempire','pakistan','palau','panama','papuanewguinea','paraguay','peru','philippines','poland','portugal','prussia','qatar','romania','rome','russianfederation','rwanda','stkitts&nevis','stlucia','saintvincent&the','grenadines','samoa','sanmarino','saotome&principe','saudiarabia','senegal','serbia','seychelles','sierraleone','singapore','slovakia','slovenia','solomonislands','somalia','southafrica','spain','srilanka','sudan','suriname','swaziland','sweden','switzerland','syria','tajikistan','tanzania','thailand','togo','tonga','trinidad&tobago','tunisia','turkey','turkmenistan','tuvalu','uganda','ukraine','unitedarabemirates','unitedkingdom','uruguay','uzbekistan','vanuatu','vaticancity','venezuela','vietnam','yemen','zambia','zimbabwe'];
          
      var dummyHashes = _.map(dummyWords, function(name) {
            return '0x' + web3.sha3(name);
          });


      AuctionStartedEvent.watch(function(error, result) {
        if (!error) {            
            LocalStore.set('lastBlockLooked', result.blockNumber);

            if(dummyHashes.indexOf(result.args.hash) > -1) {
              var name = dummyWords[dummyHashes.indexOf(result.args.hash)];

              PublicAuctions.upsert({name: name}, 
                { $set: { 
                  fullname: name + '.eth',
                  registrationDate: result.args.auctionExpiryDate.toFixed()
                }})
            }    
        } 
      });



      HashRegisteredEvent.watch(function(error, result) {
        if (!error) {
            var value = Number(web3.fromWei(result.args.value.toFixed(), 'ether'));
            
            LocalStore.set('lastBlockLooked', result.blockNumber);
            LocalStore.set('NamesRegistered', LocalStore.get('NamesRegistered') + 1 );

            var averageValue = LocalStore.get('AverageValue') || value;

            if (value > 0.01) {
              var disputedNames = LocalStore.get('DisputedNamesRegistered') + 1;
              LocalStore.set('DisputedNamesRegistered',  disputedNames);
              averageValue = (averageValue * disputedNames + value) / (disputedNames + 1);
              LocalStore.set('DisputedNamesRegistered', disputedNames);
            }

            // console.log('HashRegistered', result.args.hash, value, 'ether', LocalStore.get('NamesRegistered'), LocalStore.get('DisputedNamesRegistered'), averageValue);

            LocalStore.set('AverageValue', averageValue );

            if(dummyHashes.indexOf(result.args.hash) > -1) {
              var name = dummyWords[dummyHashes.indexOf(result.args.hash)];

              console.log('\n Known name registered!', name, value);

            //   PublicAuctions.upsert({name: name}, 
            //     { $set: { 
            //       fullname: name + '.eth',
            //       registrationDate: result.args.auctionExpiryDate.toFixed()
            //     }})
            }    
        } 
      });      

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
      .then(watchEvents)
      .then(() => {
        //set a global for easier debugging on the console
        g = {ens, registrar, network};
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

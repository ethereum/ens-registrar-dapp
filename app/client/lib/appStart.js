import ENS from 'ethereum-ens';
import Registrar from 'eth-registrar-ens';

if(location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')
    Meteor.disconnect();

var connectToNode = function() {
  //Init collections
  EthAccounts.init();
  EthBlocks.init();

  //Init ENS
  ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');
  registrar = new Registrar(web3, ens.owner('eth'), 7, 'eth', ens.registry.address);
}

//Called from Meteor.startup below
var connect = function(){
    console.log('connect');
    if(web3.isConnected()) {
        // only start app operation, when the node is not syncing (or the eth_syncing property doesn't exists)
        web3.eth.getSyncing(function(e, sync) {
            if(e || !sync) {
              connectToNode();
            }
        });
    } else {
        console.log('not connected, firing modal...');
        // make sure the modal is rendered after all routes are executed
        Meteor.setTimeout(function(){
            // if in mist, tell to start geth, otherwise start with RPC
            var gethRPC = (web3.admin) ? 'geth' : 'geth --rpc --rpccorsdomain "'+window.location.protocol + '//' + window.location.host+'"';

            EthElements.Modal.question({
                text: new Spacebars.SafeString(TAPi18n.__('dapp.app.texts.connectionError' + (web3.admin ? 'Mist' : 'Browser'),
                    {node: gethRPC})),
                ok: function(){
                    Tracker.afterFlush(function(){
                        connect();
                    });
                }
            }, {
                closeable: false
            });

        }, 600);
    }
}

Meteor.startup(function(){
    // delay so we make sure the data is already loaded from the indexedDB
    // TODO improve persistent-minimongo2 ?
    Meteor.setTimeout(function() {
        connect();
    }, 3000);
});

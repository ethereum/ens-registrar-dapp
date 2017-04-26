import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-open'].events({
  'click .open-auction': function openAuction() {
    let name = Session.get('searched');
    let template = Template.instance();
    var launchRatio = (Date.now()/1000 - registrar.registryStarted.toFixed())/(13*7*24*60*60);

    console.log('registryStarted', launchRatio, registrar.registryStarted.toFixed());
    // The goal here is to obscure the names we actually want
    function randomName() {
      // gets a random name from our preimage hash
      return '0x' + web3.sha3(knownNames[Math.floor(Math.random()*knownNames.length*launchRatio)]).replace('0x','');
    }

    function randomHash() {
      // gets a random hash
      var randomHex = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
            .times(launchRatio.toString())
            .times(Math.random().toString())
            .floor().toString(16);

      var padding = '0x0000000000000000000000000000000000000000000000000000000000000000';

      return padding.slice(0, 66 - randomHex.length) + randomHex;
    }

    function randomMix() {
      // gets a random name we know about
      var availableNow = _.pluck(Names.find({mode:'open', name:{$not: name}, availableDate: {$lt: Date.now()/1000}}).fetch(), 'name');
      if (availableNow.length > 2) {
        return '0x' + web3.sha3(availableNow[Math.floor(Math.random()*availableNow.length)]).replace('0x','')
      } else {
        return Math.random() > 0.5 ? randomHash() : randomName();
      }
    }

    // Check if the name is in the dictionary 
    if (knownNames.indexOf(name) > 0) {
      // if so, add a hash that isn't 
      var dummyHashes = [randomHash(), randomMix()];
    } else {
      // Otherwise, add a name that is
      var dummyHashes = [randomName(), randomMix()];
    }
    
    if (web3.eth.accounts.length == 0) {
      alert('No accounts found');
    } else {
      TemplateVar.set(template, 'opening-' + name, true)
      registrar.openAuction(name, dummyHashes, {
        from: web3.eth.accounts[0],
        gas: 1000000
      }, Helpers.getTxHandler({
        onDone: () => TemplateVar.set(template, 'opening-' + name, false),
        onSuccess: () => {
          Names.upsert({name: name},{$set: {fullname: name + ".eth", mode: 'open', watched: true}});
          Helpers.refreshStatus();
        }
      }));
    }
  },
  'click .explainer': function (e) {
    e.preventDefault();
    EthElements.Modal.show('modals_explainer', {
        class: 'explainer-modal'
      });
  },
  'change #agreement': function(e) {
    let template = Template.instance();

    TemplateVar.set(template, 'agree', e.currentTarget.checked ? true : false);
  }
})

Template['status-open'].helpers({
  opening() {
    return TemplateVar.get('opening-' + Session.get('searched'));
  },
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name}).count() > 0 ;
  },
  hasNode() {
    return LocalStore.get('hasNode');
  }
})
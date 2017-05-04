import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';
import { updatePendingBids } from '/imports/lib/bids';
var template;

Template['components_newBid'].onRendered(function() {
  template = this;
  TemplateVar.set(template, 'anonymizer', 0.5);
  let launchRatio = (Date.now()/1000 - registrar.registryStarted.toFixed())/(8*7*24*60*60);
  console.log('launchRatio', launchRatio);

  if (web3.eth.accounts.length > 0 ){
    web3.eth.getBalance(web3.eth.accounts[0], function(e, balance) { 
      var maxAmount = Number(web3.fromWei(balance, 'ether').toFixed());
      var depositAmount = Math.floor(100*Math.random() * Math.min(maxAmount, 1))/100;
      TemplateVar.set(template, 'maxAmount', maxAmount);
      TemplateVar.set(template, 'depositAmount', depositAmount);
    });
  }

  // The goal here is to obscure the names we actually want
  template.randomName = function() {
    if (typeof knownNames !== "undefined") {
      // gets a random name from our preimage hash
      return '0x' + web3.sha3(knownNames[Math.floor(Math.random()*knownNames.length*launchRatio)]).replace('0x','');
    } else {
      return template.randomMix();
    }
    
  }

  template.randomHash = function() {
    // gets a random hash
    var randomHex = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
          .times(launchRatio.toString())
          .times(Math.random().toString())
          .floor().toString(16);

    var padding = '0x0000000000000000000000000000000000000000000000000000000000000000';

    return padding.slice(0, 66 - randomHex.length) + randomHex;
  }

  template.randomMix = function() {
    // gets a random name we know about
    var availableNow = _.pluck(Names.find({mode:'open', name:{$not: name}, availableDate: {$lt: Date.now()/1000}}).fetch(), 'name');
    if ( Math.random() * 20 < availableNow.length ) {
      return '0x' + web3.sha3(availableNow[Math.floor(Math.random()*availableNow.length)]).replace('0x','')
    } else {
      return Math.random() > 0.5 ? template.randomHash() : template.randomName();
    }
  }

  template.createHashesArray = function() {
    let hashedName = '0x' + web3.sha3(name).replace('0x','')
    let entry = Names.findOne({name: name});
    if (entry && entry.mode && entry.mode == 'auction') { 
      // If the name is already open, just create some dummy hashes
      var hashesArray = [template.randomHash(), template.randomName(), template.randomMix()];

    } else if (typeof knownNames !== "undefined" && knownNames.indexOf(name) > 0) {
      // if the name is in the dictionary add a hash that isn't 
      var hashesArray = [template.randomHash(), template.randomMix(), hashedName];
    } else {
      // Otherwise, add a name that is
      var hashesArray = [template.randomName(), template.randomMix(), hashedName];
    }
    
    TemplateVar.set(template, 'hashesArray', hashesArray);

    console.log('hashesArray created', name, typeof knownNames !== "undefined" ?  _.map(hashesArray, (e)=>{ return binarySearchNames(e)}) : '', _.map(hashesArray, (e)=>{ var n = Names.findOne({hash: e.slice(2,14)}); return n ? n.name : ''}));
  };

  let name = Session.get('searched');
  console.log('name:', name);
  template.createHashesArray(name);

  this.autorun(() => {

    let name = Session.get('searched');
    let dictionaryLoaded = typeof knownNames !== "undefined";
    console.log('name:', name);
    template.createHashesArray(name);

  });

});

Template['components_newBid'].events({
  'submit .new-bid'(event, template) {
    event.preventDefault();

    const target = event.target;
    const bidAmount = EthTools.toWei(TemplateVar.get(template, 'bidAmount'), 'ether');
    let totalDeposit = TemplateVar.get(template, 'depositAmount')+TemplateVar.get(template, 'bidAmount');
    const depositAmount = EthTools.toWei(totalDeposit, 'ether');
    const name = Session.get('name');
    let secret;
    template.createHashesArray(name);
    
    if (window.crypto && window.crypto.getRandomValues) {
      secret = window.crypto.getRandomValues(new Uint32Array(10)).join('');
    } else {
      EthElements.Modal.question({
        text: 'Your browser does not support window.crypto.getRandomValues ' + 
          'your bid anonymity is going to be weaker.',
        ok: true
      });
      secret = Math.floor(Math.random()*1000000).toString() +
        Math.floor(Math.random()*1000000).toString() +
        Math.floor(Math.random()*1000000).toString() +
        Math.floor(Math.random()*1000000).toString();
    }
    console.log('secret', secret);

    if (web3.eth.accounts.length == 0) {
      GlobalNotification.error({
          content: 'No accounts added to dapp',
          duration: 3
      });
    } else if (!bidAmount || bidAmount < 10000000000000000) {
      GlobalNotification.error({
          content: 'Bid below minimum value',
          duration: 3
      });
    } else {
      TemplateVar.set(template, 'bidding-' + name, true)
      let owner = web3.eth.accounts[0];
      registrar.bidFactory(name, owner, bidAmount, secret, (err, bid) => {
        if(err != undefined) throw err;

        PendingBids.insert(Object.assign({
          date: Date.now(),
          depositAmount
        }, bid));

        Names.upsert({name: name}, {$set: { watched: true}});

        var hashesArray = TemplateVar.get(template, 'hashesArray')
        if (hashesArray && hashesArray.length == 3) {
          registrar.submitBid(bid, hashesArray,  {
              value: depositAmount, 
              from: owner,
              gas: 900000
            }, Helpers.getTxHandler({
              onDone: () => TemplateVar.set(template, 'bidding-' + Session.get('searched'), false),
              onSuccess: () => updatePendingBids(name)
            }));
        } else {
          console.log('Hash array not loading', hashesArray);

          EthElements.Modal.question({
            text: 'Bid failed, please refresh your page and try again <br> If the problem persists, <a href="https://github.com/ethereum/ens-registrar-dapp/issues/new"> submit an issue </a> ',
            ok: true
          });

          TemplateVar.set(template, 'bidding-' + Session.get('searched'), false);         
          return;
        }
      });
    }
  },
  /**
  Change the Bid amount
  
  @event change input[name="fee"], input input[name="fee"]
  */
  'input input[name="bidAmount"]': function(e){
    var maxAmount = TemplateVar.get('maxAmount');
    var bidAmount = Math.min(Number(e.currentTarget.value) || 0.01, maxAmount);
    var depositAmount = Math.floor(100*Math.random()*(Math.min(maxAmount, bidAmount*10) - bidAmount)/2)/100;
    TemplateVar.set('bidAmount', bidAmount);
    TemplateVar.set('depositAmount', depositAmount);
  },
  /**
  Deposit amount  
  */
  'change input[name="depositAmount"], input input[name="depositAmount"]': function(e){
      TemplateVar.set('depositAmount', Number(e.currentTarget.value));
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

Template['components_newBid'].helpers({
  bidding() {
    return TemplateVar.get('bidding-' + Session.get('searched'));
  },
  depositAmount(){
    return TemplateVar.get('depositAmount');
  },
  dictionaryLoaded() {
    return typeof knownNames !== "undefined";
  }
})
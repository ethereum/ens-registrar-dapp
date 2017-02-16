import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';
import { updatePendingBids } from '/imports/lib/bids';
var template;

Template['status-auction'].onCreated(function() {
  template = this;
  this.autorun(() => {
    const {name, entry} = Template.currentData();
    TemplateVar.set(template, 'entryData', entry);
  });
  TemplateVar.set(template, 'anonymizer', 0.5);
});

Template['status-auction'].events({
  'submit .new-bid'(event, template) {
    event.preventDefault();
    
    const target = event.target;
    const bidAmount = EthTools.toWei(target.bidAmount.value, 'ether');
    const depositAmount = EthTools.toWei(Number(target.bidAmount.value) + Math.random() * TemplateVar.get('anonymizerAmount'), 'ether');
    const name = Session.get('name');
    let secret;
    let accounts = EthAccounts.find().fetch();
    
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

    if (accounts.length == 0) {
      GlobalNotification.error({
          content: 'No accounts added to dapp',
          duration: 3
      });
    } else if (bidAmount < 10000000000000000) {
      GlobalNotification.error({
          content: 'Bid below minimum value',
          duration: 3
      });
    } else {
      TemplateVar.set(template, 'bidding-' + Session.get('searched'), true)
      let owner = accounts[0].address;
      registrar.bidFactory(name, owner, bidAmount, secret, (err, bid) => {
        if(err != undefined) throw err;

        console.log('Bid: ', bid);
        PendingBids.insert(Object.assign({
          date: Date.now(),
          depositAmount
        }, bid));
          
        registrar.submitBid(bid, {
          value: depositAmount, 
          from: owner,
          gas: 500000
        }, Helpers.getTxHandler({
          onDone: () => TemplateVar.set(template, 'bidding-' + Session.get('searched'), false),
          onSuccess: () => updatePendingBids(name)
        }));
      });
    }
  },
  /**
  Change the Bid amount
  
  @event change input[name="fee"], input input[name="fee"]
  */
  'change input[name="bidAmount"], input input[name="bidAmount"]': function(e){
      TemplateVar.set('bidAmount', Number(e.currentTarget.value));
  },
  /**
  Anonymizer slider  
  */
  'change input[name="anonymizer"], input input[name="anonymizer"]': function(e){
      TemplateVar.set('anonymizer', Number(e.currentTarget.value));
  } 
})



Template['status-auction'].helpers({
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name}).count() > 0 ;
  },
  bidding() {
    return TemplateVar.get('bidding-' + Session.get('searched'));
  },
  anonymizerAmount() {
    let mainAccount = EthAccounts.find().fetch()[0].address;
    web3.eth.getBalance(mainAccount, function(e, balance) { 
        TemplateVar.set(template, 'maxAmount', web3.fromWei(balance, 'ether').toFixed());
    });

    let maxAmount = TemplateVar.get(template, 'maxAmount');

    let amount = Math.floor(10 * (maxAmount * Math.pow(TemplateVar.get('anonymizer'), 3)))/10;
    TemplateVar.set('anonymizerAmount', amount);
    return amount;
  }
})


Template['aside-auction'].onCreated(function() {
  var template = this;
  this.autorun(() => {
    const {name, entry} = Template.currentData();
    TemplateVar.set(template, 'entryData', entry);
    TemplateVar.set(template, 'revealDate', moment(entry.registrationDate * 1000 - 24 *60*60*1000));
  });
});


Template['aside-auction'].helpers({ 
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  revealDate() {
    var m = TemplateVar.get('revealDate');

    return m.format('YYYY-MM-DD HH:mm');
  }, 
  timeRemaining() {
    var m = TemplateVar.get('revealDate');

    if (m.diff(moment(), 'hours') > 48) {
      return Math.floor(m.diff(moment(), 'hours')/24) + ' days, ' + Math.floor(m.diff(moment(), 'hours')%24) + ' hours'
    } else {
        return Math.floor(m.diff(moment(), 'minutes')/60) + 'h ' + Math.floor(m.diff(moment(), 'minutes')%60) + 'm ' + Math.floor(m.diff(moment(), 'seconds')%60) + 's';

    }
  }
})

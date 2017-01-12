import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-auction'].onCreated(function() {
  var template = this;
  TemplateVar.set(template, 'entryData', Template.instance().data.entry);
  TemplateVar.set(template, 'anonymizer', 0.3)
});

Template['status-auction'].events({
  'submit .new-bid'(event) {
    event.preventDefault();
    
    const target = event.target;
    const bidAmount = EthTools.toWei(target.bidAmount.value, 'ether');
    const randomFactor = 1 + Math.random() * (TemplateVar.get('anonymizerAmount') - 100) / 100;
    const depositAmount = EthTools.toWei(target.bidAmount.value * randomFactor, 'ether');
    const name = Session.get('searched');
    const secret = Math.random().toString();
    const template = Template.instance();
    let accounts = EthAccounts.find().fetch();

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
      TemplateVar.set(template, 'bidding', true)
      let owner = accounts[0].address;
      let bid = registrar.bidFactory(name, owner, bidAmount, secret);
      console.log('Bid: ', bid);
      registrar.submitBid(bid, {
        value: depositAmount, 
        from: owner,
        gas: 500000
      }, (err, txid) => {
        if (err) {
          TemplateVar.set(template, 'bidding', false)
          GlobalNotification.error({
                content: err.toString(),
                duration: 3
            });
          return;
        } 
        console.log(txid)
        Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
          if (err) {
            GlobalNotification.error({
                content: err.toString(),
                duration: 3
            });

            TemplateVar.set(template, 'bidding', false)
            return;
          }
          if (isSuccessful) {
            MyBids.insert({
              txid,
              name,
              owner,
              fullName: name + '.eth',
              bidAmount,
              depositAmount,
              date: Date.now(),
              bid: bid,
              revealed: false
            });
          } else {
            GlobalNotification.error({
                content: 'The transaction failed',
                duration: 3
            });
          }
          TemplateVar.set(template, 'bidding', false)
        })
      });
    }
  },
  /**
  Change the selected fee
  
  @event change input[name="fee"], input input[name="fee"]
  */
  'change input[name="anonymizer"], input input[name="anonymizer"]': function(e){
      TemplateVar.set('anonymizer', Number(e.currentTarget.value));
  } 
})



Template['status-auction'].helpers({
  bidding() {
    return TemplateVar.get('bidding')
  },
  anonymizerAmount() {
    var amount = Math.round(100*Math.pow(10,TemplateVar.get('anonymizer')));
    TemplateVar.set('anonymizerAmount', amount);
    return amount;
  }
})



Template['aside-auction'].onCreated(function() {
  var template = this;
  TemplateVar.set(template, 'entryData', Template.instance().data.entry);
  TemplateVar.set(template, 'revealDate', moment(TemplateVar.get('entryData').registrationDate * 1000 - 24 *60*60*1000));
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

    if (m.diff(moment(), 'hours') > 24) {
      return Math.floor(m.diff(moment(), 'hours')/24) + ' days, ' + Math.floor(m.diff(moment(), 'hours')%24) + ' hours'
    } else {
        return Math.floor(m.diff(moment(), 'minutes')/60) + ' hours, ' + Math.floor(m.diff(moment(), 'minutes')%60) + ' minutes'

    }
  }
})

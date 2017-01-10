import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-auction'].onCreated(function() {
  TemplateVar.set(this, 'entryData', Template.instance().data.entry);
});

Template['status-auction'].events({
  'submit .new-bid'(event) {
    event.preventDefault();
    
    const target = event.target;
    const bidAmount = EthTools.toWei(target.bidAmount.value);
    const depositAmount = EthTools.toWei(target.depositAmount.value);
    const name = Session.get('searched');
    const masterPassword = 'asdf';
    const template = Template.instance();
    let accounts = EthAccounts.find().fetch();
    
    if (accounts.length == 0) {
      alert('No accounts added to dapp');
    } else {
      TemplateVar.set(template, 'bidding', true)
      let owner = accounts[0].address;
      let bid = registrar.bidFactory(name, owner, bidAmount,
        masterPassword);//todo: derive the salt using the password and the name
      console.log('Bid: ', bid);
      registrar.submitBid(bid, {
        value: depositAmount, 
        from: owner,
        gas: 500000
      }, (err, txid) => {
        if (err) {
          TemplateVar.set(template, 'bidding', false)
          alert(err)
          return;
        } 
        console.log(txid)
        Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
          if (err) {
            alert(err)
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
              masterPassword,
              bid: bid,
              revealed: false
            });
          } else {
            alert('The transaction failed')
          }
          TemplateVar.set(template, 'bidding', false)
        })
      });
    }
  }
})

Template['status-auction'].helpers({
  registrationDate() {
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000);
    return date.toLocaleString();
  },
  bidding() {
    return TemplateVar.get('bidding')
  }
})

Template['aside-auction'].helpers({
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  }
})

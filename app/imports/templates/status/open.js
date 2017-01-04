import { registrar } from '/imports/lib/ethereum';

Template['status-open'].onCreated(function() {
  var myPrimaryAccount = EthAccounts.findOne({name: 'Coinbase'});
  console.log(myPrimaryAccount);
});

Template['status-open'].helpers({

})

Template['status-open'].events({
  'click .open-auction': function openAuction() {
    let name = Session.get('searched');
    let accounts = EthAccounts.find().fetch();
    if (accounts.length == 0) {
      alert('No accounts added to Dapp');
    } else {
      registrar.openAuction(name, {
        from: accounts[0].address,
        gas: 1000000
      }, (err, res) => {
        if (err) {
          alert(err)
        } else {
          console.log(res);
          alert(res + ' (also printed on console)');
        }
      })
    }
  }
})
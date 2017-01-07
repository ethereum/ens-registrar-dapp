import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-auction'].events({
  'submit .new-bid'(event) {
    event.preventDefault();
    
    const target = event.target;
    const bidAmount = target.bidAmount.value;
    const depositAmount = target.depositAmount.value;
    const name = Session.get('searched');
    const masterPassword = 'asdf';
    let accounts = EthAccounts.find().fetch();
    
    if (accounts.length == 0) {
      alert('No accounts added to dapp');
    } else {
      let owner = accounts[0].address;
      let bid = registrar.shaBid(name, owner, bidAmount,
        masterPassword);//todo: derive the salt using the password and the name
      registrar.newBid(bid, {
        value: depositAmount, 
        from: owner,
        gas: 500000
      }, (err, txid) => {
        if (err) {
          alert(err)
          return;
        } 
        console.log(txid)
        Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
          if (err) {
            alert(err)
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
              masterPassword
            });
          } else {
            alert('The transaction failed')
          }
        })
      });
    }
  }
})

Template['aside-auction'].helpers({
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  }
})

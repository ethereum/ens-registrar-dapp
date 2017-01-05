import { registrar } from '/imports/lib/ethereum';

Template['status-auction'].events({
  'submit .new-bid'(event) {
    event.preventDefault();

    const target = event.target;
    const bidAmount = target.bidAmount.value;
    const depositAmount = target.depositAmount.value;
    const name = Session.get('searched');
    let accounts = EthAccounts.find().fetch();
    
    if (accounts.length == 0) {
      alert('No accounts added to Dapp');
    } else {
      let bid = registrar.shaBid(name, accounts[0].address, bidAmount, 'asdf');
      registrar.newBid(bid, {
        value: depositAmount, 
        from: accounts[0].address,
        gas: 500000
      }, (err, res) => {
        if (err) {
          console.log(err)
        } else {
          console.log(res)
        }
      });
    }
  }
})


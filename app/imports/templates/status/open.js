import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-open'].events({
  'click .open-auction': function openAuction() {
    let name = Session.get('searched');
    let accounts = EthAccounts.find().fetch();
    if (accounts.length == 0) {
      alert('No accounts found');
    } else {
      registrar.openAuction(name, {
        from: accounts[0].address,
        gas: 1000000
      }, (err, txid) => {
        if (err) {
          alert(err)
          return;
        }
        Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
          if (err) {
            alert(err)
            return;
          }
          if (isSuccessful) {
            Helpers.refreshStatus();
          } else {
            alert('Transaction failed')
          }
        })
      })
    }
  }
})
import { registrar } from '/imports/lib/ethereum';
import refreshStatus from '/imports/lib/refresh-status';

Template['status-open'].helpers({
  openAuction() {
    return function(callback) {
      let name = Session.get('searched');
      let accounts = EthAccounts.find().fetch();
      if (accounts.length == 0) {
        callback('No accounts found');
      } else {
        registrar.openAuction(name, {
          from: accounts[0].address,
          gas: 1000000
        }, callback)
      }
    };
  },
  refreshStatus() {
    return refreshStatus;
  }
})
import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-open'].events({
  'click .open-auction': function openAuction() {
    let name = Session.get('searched');
    let accounts = EthAccounts.find().fetch();
    let template = Template.instance();
    
    if (accounts.length == 0) {
      GlobalNotification.error({
                content: 'No accounts found',
                duration: 3
            });
    } else {
      TemplateVar.set(template, 'opening', true)
      registrar.openAuction(name, {
        from: accounts[0].address,
        gas: 1000000
      }, (err, txid) => {
        if (err) {
          TemplateVar.set(template, 'opening', false)
          GlobalNotification.error({
                content: err.toString(),
                duration: 3
            });
          return;
        }
        Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
          if (err) {
            TemplateVar.set(template, 'opening', false)
            GlobalNotification.error({
                content: err.toString(),
                duration: 3
            });
            return;
          }
          if (isSuccessful) {
            Helpers.refreshStatus();
          } else {
            GlobalNotification.error({
                content: 'Transaction failed',
                duration: 3
            });
          }
          TemplateVar.set(template, 'opening', false)
        })
      })
    }
  }
})

Template['status-open'].helpers({
  opening() {
    return TemplateVar.get('opening');
  }
})
import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-open'].events({
  'click .open-auction': function openAuction() {
    let name = Session.get('searched');
    let accounts = EthAccounts.find().fetch();
    let template = Template.instance();
    
    if (accounts.length == 0) {
      alert('No accounts found');
    } else {
      TemplateVar.set(template, 'opening', true)
      registrar.openAuction(name, {
        from: accounts[0].address,
        gas: 1000000
      }, (err, txid) => {
        if (err) {
          TemplateVar.set(template, 'opening', false)
          alert(err)
          return;
        }
        Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
          if (err) {
            TemplateVar.set(template, 'opening', false)
            alert(err)
            return;
          }
          if (isSuccessful) {
            Helpers.refreshStatus();
          } else {
            alert('Transaction failed')
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
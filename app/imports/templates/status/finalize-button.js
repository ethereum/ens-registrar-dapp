import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['finalizeButton'].events({
  'click .finalize': function() {
    const name = Session.get('searched');
    const template = Template.instance();
    let accounts = EthAccounts.find().fetch();
    
    if (accounts.length == 0) {
      alert('No accounts added to dapp');
      return;
    }
    TemplateVar.set(template, 'finalizing', true);
    registrar.finalizeAuction(name, {
      from: accounts[0].address,
      gas: 1000000
    }, (err, txid) => {
      if (err) {
        alert(err)
        TemplateVar.set(template, 'finalizing', false);
        return;
      }
      console.log(txid)
      Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
        if (err) {
          alert(err)
          TemplateVar.set(template, 'finalizing', false)
          return;
        }
        if (isSuccessful) {
          Helpers.refreshStatus();
        } else {
          alert('Finalizing the auction failed')
        }
        TemplateVar.set(template, 'finalizing', false)
      });
    })
  }
})

Template['finalizeButton'].helpers({
  finalizing() {
    return TemplateVar.get('finalizing');
  }
})
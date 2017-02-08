import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-open'].events({
  'click .open-auction': function openAuction() {
    let name = Session.get('searched');
    let accounts = EthAccounts.find().fetch();
    let template = Template.instance();
    
    if (accounts.length == 0) {
      GlobalNotification.error({
          content: 'No accounts added to dapp',
          duration: 3
      });
    } else {
      TemplateVar.set(template, 'opening', true)
      registrar.openAuction(name, {
        from: accounts[0].address,
        gas: 1000000
      }, Helpers.getTxHandler({
        onTxSuccess: () => Helpers.refreshStatus(),
        onDone: () => TemplateVar.set(template, 'opening', false)
      }));
    }
  }
})

Template['status-open'].helpers({
  opening() {
    return TemplateVar.get('opening');
  }
})
import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['finalizeButton'].events({
  'click .finalize': function() {
    const name = Session.get('searched');
    const template = Template.instance();
    let accounts = EthAccounts.find().fetch();
    
    if (accounts.length == 0) {
      GlobalNotification.error({
          content: 'No accounts added to dapp',
          duration: 3
      });
      return;
    }
    TemplateVar.set(template, 'finalizing', true);
    registrar.finalizeAuction(name, {
      from: accounts[0].address,
      gas: 1000000
    }, Helpers.getTxHandler({
      onTxSuccess: () => Helpers.refreshStatus(),
      onDone: () => TemplateVar.set(template, 'finalizing', false)
    }));
  }
})

Template['finalizeButton'].helpers({
  finalizing() {
    return TemplateVar.get('finalizing');
  }
})
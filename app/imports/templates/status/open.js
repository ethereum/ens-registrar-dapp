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
      }, Helpers.getTxHandler({
        onDone: () => TemplateVar.set(template, 'opening', false),
        onSuccess: () => Helpers.refreshStatus()
      }));
    }
  }
})

Template['status-open'].helpers({
  opening() {
    return TemplateVar.get('opening');
  }
})
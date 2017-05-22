import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-open'].onCreated(function() {
  template = this;
  web3.eth.getAccounts((err, accounts) => {
    if (!err && accounts && accounts.length > 0) {
      TemplateVar.set(template, 'mainAccount', accounts[0]);
    }
  })  
});

Template['status-open'].events({
  'click .open-auction': function openAuction() {
    let name = Session.get('searched');
    let template = Template.instance();
    const gasPrice = TemplateVar.getFrom('.dapp-select-gas-price', 'gasPrice') || web3.toWei(20, 'shannon');
    var hashes = TemplateVar.getFrom('.new-bid', 'hashesArray');
    let mainAccount = TemplateVar.get(template, 'mainAccount');    

    // check if hashes are present
    if (!hashes || !(hashes.length > 0)) {
      GlobalNotification.error({
          content: 'Dictionary not loaded. Wait a few seconds and try again',
          duration: 3
      });
      return;
    }

    // remove the desired name from the dummy list to avoid duplicates
    var i = hashes.indexOf('0x'+web3.sha3(name).replace('0x',''))
    if (i > -1) {
        hashes.splice(i, 1);
    }

    if (!mainAccount) {
        GlobalNotification.error({
          content: 'No accounts added to dapp',
          duration: 3
        });
      } else {
      TemplateVar.set(template, 'opening-' + name, true)
      registrar.openAuction(name, hashes, {
        from: mainAccount,
        gas: 300000,
        gasPrice: gasPrice
      }, Helpers.getTxHandler({
        onDone: () => TemplateVar.set(template, 'opening-' + name, false),
        onSuccess: () => {
          Names.upsert({name: name},{$set: {fullname: name + ".eth", mode: 'open', watched: true}});
          Helpers.refreshStatus();
        }
      }));
    }
  }
})

Template['status-open'].helpers({
  opening() {
    return TemplateVar.get('opening-' + Session.get('searched'));
  },
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name}).count() > 0 ;
  },
  hasNode() {
    return LocalStore.get('hasNode');
  }
})
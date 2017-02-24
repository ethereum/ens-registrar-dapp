import { ens, registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-owned'].onCreated(function() {
  this.autorun(() => {
    const {name, entry} = Template.currentData();
    
    TemplateVar.set(this, 'entryData', entry);
    TemplateVar.set(this, 'owner', null);
    TemplateVar.set(this, 'address', null);
    TemplateVar.set(this, 'content', null);
    
    ens.owner(name, (err, res) => {
      if (!err) {
        TemplateVar.set(this, 'owner', res);
      }
    });
    ens.resolver(name, (err, res) => {
      if (err) {
        return;
      }
      res.addr((err, address) => {
        if (!err) {
          TemplateVar.set(this, 'address', address);
        }
      });
      res.content((err, content) => {
        if (!err) {
          TemplateVar.set(this, 'content', content);
        }
      })
    });
  })
});

Template['status-owned'].helpers({
  address() {
    return TemplateVar.get('address')
  },
  owner() {
    return TemplateVar.get('owner')
  },
  isMine() {
    const owner = TemplateVar.get('owner');
    return web3.eth.accounts.filter((acc) => acc == owner).length > 0;
  },
  registrationDate() {
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000);
    return date.toISOString().slice(0,10);
  },
  releaseDate() {
    var releaseDate = new Date((TemplateVar.get('entryData').registrationDate + 365 * 24 * 60 * 60) * 1000);
    return releaseDate.toISOString().slice(0,10);
  },
  canRelease() {
    var releaseDate = new Date((TemplateVar.get('entryData').registrationDate + 365 * 24 * 60 * 60) * 1000);

    return Date.now() > releaseDate;
  },
  deedValue() {
    var val = TemplateVar.get('entryData').deed.balance;
    return web3.fromWei(val.toFixed(), 'ether');
  },
  deedValueIsMin() {
    var val = TemplateVar.get('entryData').deed.balance;
    return val.toFixed() == 10000000000000000;
  },
  renewalDate() {
    var years = 365 * 24 * 60 * 60 * 1000;
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000 + 2 * years);
    return date.toISOString().slice(0,10);
  },
  highestBid() {
    var val = TemplateVar.get('entryData').highestBid;
    return web3.fromWei(val, 'ether');
  },
  content() {
    return TemplateVar.get('content') == '0x' ? 'not set' : TemplateVar.get('content') ;
  },
  transferring() {
    return TemplateVar.get('transferring');
  },
  releasing() {
    return TemplateVar.get('releasing');
  },
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name, revealed: false});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name, revealed: false}).count() > 0 ;
  }
})

Template['status-owned'].events({
  'click .transfer': function(e, template) {
    const owner = TemplateVar.get('owner');
    const newOwner = TemplateVar.getFrom('.transfer-section .dapp-address-input', 'value');
    const name = template.data.entry.name;
    if (!newOwner) {
      GlobalNotification.error({
          content: 'No address chosen',
          duration: 3
      });
      return;
    }
    TemplateVar.set(template, 'transferring', true);
    registrar.transfer(name, newOwner, { from: owner, gas: 300000 },
      Helpers.getTxHandler({
        onSuccess: () => GlobalNotification.warning({
          content: 'Transfer completed',
          duration: 5
      }),
        onDone: () => TemplateVar.set(template, 'transferring', false),
        onError: () => {
          GlobalNotification.error({
            content: 'Could not transfer name',
            duration: 5
          });
          TemplateVar.set(template, 'releasing', false);
      }
      })
    );
  },
  'click .release': function(e, template) {
    const owner = TemplateVar.get('owner');
    const name = template.data.entry.name;

    TemplateVar.set(template, 'releasing', true);
    registrar.releaseDeed(name, { from: owner, gas: 300000 },
      Helpers.getTxHandler({
        onSuccess: () => GlobalNotification.warning({
          content: 'Name released',
          duration: 5
      }),
        onDone: () => TemplateVar.set(template, 'releasing', false),
        onError: () => {
          GlobalNotification.error({
            content: 'Could not release name',
            duration: 5
          });
          TemplateVar.set(template, 'releasing', false);
      }
    })
    );
  }  
});

Template['aside-owned'].helpers({
  deedValue() {
    var val = Template.instance().data.entry.deed.balance;
    return web3.fromWei(val.toFixed(), 'ether');
  }
})


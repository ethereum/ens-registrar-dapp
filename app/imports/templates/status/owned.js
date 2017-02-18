import { ens } from '/imports/lib/ethereum';

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
  registrationDate() {
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000);
    return date.toLocaleString();
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
    return date.toLocaleDateString();
  },
  highestBid() {
    var val = TemplateVar.get('entryData').highestBid;
    return web3.fromWei(val, 'ether');
  },
  content() {
    return TemplateVar.get('content') == '0x' ? 'not set' : TemplateVar.get('content') ;
  }
})


Template['aside-owned'].helpers({
  deedValue() {
    var val = Template.instance().data.entry.deed.balance;
    return web3.fromWei(val.toFixed(), 'ether');
  }
})

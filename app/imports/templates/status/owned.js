import { ens } from '/imports/lib/ethereum';

Template['status-owned'].onCreated(function() {
  TemplateVar.set(this, 'entryData', Template.instance().data.entry);

  var name = Template.instance().data.name;
  TemplateVar.set(this, 'owner', ens.owner(name))
  ens.resolver(name, (err, res) => {
    if (!err) {
      TemplateVar.set(this, 'address', res.addr());
      TemplateVar.set(this, 'content', res.content());
    }
  });

  console.log('entry', Template.instance().data.entry);
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
  renewalDate() {
    var years = 365 * 24 * 60 * 60 * 1000;
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000 + 2 * years);
    return date.toLocaleDateString();
  },
  deedValue() {
    var val = TemplateVar.get('entryData').deed.balance;
    return web3.fromWei(val.toFixed(), 'ether');
  },
  highestBid() {
    var val = TemplateVar.get('entryData').highestBid;
    return web3.fromWei(val, 'ether');
  },
  content() {
    return TemplateVar.get('content') == '0x' ? 'not set' : TemplateVar.get('content') ;
  }
})

Template['status-owned'].onCreated(function() {
  TemplateVar.set(this, 'entryData', Template.instance().data.entry);

  var name = Template.instance().data.name;
  TemplateVar.set(this, 'owner', ens.owner(name))
  ens.resolver(name, (err, res) => {
    if (!err) {
      TemplateVar.set(this, 'address', res.addr());
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
    console.log('date', TemplateVar.get('entryData').registrationDate );
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000);
    return date.toLocaleString();
  },
  deedValue() {
    console.log('deedValue', TemplateVar.get('entryData'));
    var val = TemplateVar.get('entryData').deed.balance;
    return web3.fromWei(val.toFixed(), 'ether');
  }
})

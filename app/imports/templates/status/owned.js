Template['status-owned'].onCreated(function() {
  var name = Template.instance().data.name;
  TemplateVar.set(this, 'owner', ens.owner(name))
  ens.resolver(name, (err, res) => {
    if (!err) {
      TemplateVar.set(this, 'address', res.addr());
    }
  });
});

Template['status-owned'].helpers({
  address() {
    return TemplateVar.get('address')
  },
  owner() {
    return TemplateVar.get('owner')
  }
})

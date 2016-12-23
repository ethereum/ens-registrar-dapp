Template['status-owned'].onCreated(function() {
  var name = Template.instance().data.name;
  TemplateVar.set(this, 'owner', ens.owner(name))
});

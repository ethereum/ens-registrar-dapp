import ethereum from '/imports/lib/ethereum';

Template['layout_checkConnection'].onCreated(function() {
  let services = ethereum.init();
  Object.keys(services).forEach(name => {
    //services: ethereum, sync, ens
    services[name].listenStatus(status => {
      TemplateVar.set(this, name + 'Status', status)
    })
  })
});

Template['layout_checkConnection'].helpers({
  allServicesOk() {
    return TemplateVar.get('ethereumStatus').ok &&
      TemplateVar.get('ensStatus').ok;
  }
})

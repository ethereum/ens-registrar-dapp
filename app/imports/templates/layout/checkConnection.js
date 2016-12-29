import ethereum from '/imports/lib/ethereum';

Template['layout_checkConnection'].onCreated(function() {
  let services = ethereum.init();
  Object.keys(services).forEach(name => {
    //services: ethereum, network, ensBlock, ens
    services[name].listenStatus(status => {
      TemplateVar.set(this, name + 'Status', status)
    })
    services[name].startChecking();
  })
});

Template['layout_checkConnection'].helpers({
  isReady() {
    return TemplateVar.get('ensStatus').ok;
  }
})

import { ens } from '/imports/lib/ethereum';

Template['components_address'].onCreated(function() {
  const template = Template.instance();
  template.autorun(() => {
    const addr = Template.currentData().addr;
    TemplateVar.set(template, 'name', null);
    if (!addr) {
      return;
    }
    ens.reverse(addr, (err, resolver) =>{
      if (!err && resolver.name) {
        resolver.name((err, name) => {
          if (!err) {
            TemplateVar.set(template, 'name', name);
          }
        });
      }
    })
  })
  
})

Template['components_address'].helpers({
  mine() {
    return web3.eth.accounts.filter(
      (acc) => acc === Template.instance().data.addr
    ).length > 0;
  },
  name() {
    return TemplateVar.get('name');
  }
})
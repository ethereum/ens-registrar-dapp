import { ens } from '/imports/lib/ethereum';

Template['components_address'].onCreated(function() {
  this.autorun(() => {
    const addr = Template.currentData().addr;
    const template = Template.instance();
    
    if (!template.data.addr) {
      return;
    }
    ens.reverse(template.data.addr, (err, resolver) =>{
      if (!err && resolver.name) {
        TemplateVar.set(template, 'name', resolver.name());
      }
    })
  });
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
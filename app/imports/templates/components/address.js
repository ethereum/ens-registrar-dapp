import { ens } from '/imports/lib/ethereum';

function validateName(claimedAddr, name, cb) {
  ens.resolver(name, (err, res) => {
    if (err) {
      return cb(err);
    }
    res.addr((err, actualAddr) => {
      if (err) {
        return cb(err);
      }
      cb(null, claimedAddr == actualAddr);
    });
  });
}

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
          validateName(addr, name, (err, isValid) => {
            if (!err && isValid) {
              TemplateVar.set(template, 'name', name);
            }
          });
        });
      }
    })
  })
  
})

Template['components_address'].helpers({
  hasName() {
    return TemplateVar.get('name') && TemplateVar.get('name').length > 0 ? 'has-name' : '';
  },
  mine() {
    return web3.eth.accounts.filter(
      (acc) => acc === Template.instance().data.addr
    ).length > 0;
  },
  name() {
    return TemplateVar.get('name');
  },
  addrHead() {
    return Template.instance().data.addr.slice(2,-8)
  },
  addrTail() {
    return Template.instance().data.addr.slice(-8)
  }
})
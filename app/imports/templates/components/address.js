import { ens } from '/imports/lib/ethereum';

Template['components_address'].onCreated(function() {
  this.name = new ReactiveVar();
  if (!this.data.addr) {
    return;
  }
  ens.reverse(this.data.addr, (err, resolver) =>{
    if (!err && resolver.name) {
      this.name.set(resolver.name());
    }
  })
})


Template['components_address'].helpers({
  mine() {
    return web3.eth.accounts.filter((acc) => acc === this.addr).length > 0;
  },
  name() {
    return Template.instance().name.get();
  }
})
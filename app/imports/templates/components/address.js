
Template['components_address'].helpers({
  mine() {
    return web3.eth.accounts.filter((acc) => acc === this.addr).length > 0;
  }
})
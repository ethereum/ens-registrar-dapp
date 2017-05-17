Template['components_nameLink'].events({
  'click .components_nameLink': function(e) {
    Session.set('searched', e.target.hash.slice(1));
    e.preventDefault();
  }
})

Template['components_nameLink'].helpers({
  name() {
    const name = this.name;
    if (fullname)
        return fullname.slice(0, fullname.length - 4);
  },
  fullname() {
  	return this.name + '.eth';
  }
})
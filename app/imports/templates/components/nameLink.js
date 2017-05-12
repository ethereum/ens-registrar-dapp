Template['components_nameLink'].events({
  'click .components_nameLink': function(e) {
    Session.set('searched', e.target.hash.slice(1));
    e.preventDefault();
  }
})

Template['components_nameLink'].helpers({
  name() {
    const fullname = this.fullname;
    if (fullname)
        return fullname.slice(0, fullname.length - 4);
  }
})
Template['view_names'].helpers({
  bids() {
    return MyBids.find();
  },
  names() {
    return Names.find();
  }
})

Template['view_names'].events({
  'click .names a': function(e) {
    Session.set('searched', e.target.name);
  },
  'click .export-bids': function(e) {
    EthElements.Modal.show('modals_backup');
    e.preventDefault();
  },
  'click .import-bids': function(e) {
    EthElements.Modal.show('modals_restore');
    e.preventDefault();
  }
})

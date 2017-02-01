Template['view_bids'].helpers({
  bids() {
    return MyBids.find();
  }
})

Template['view_bids'].events({
  'click .bids a': function(e) {
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

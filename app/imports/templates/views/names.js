Template['view_names'].helpers({
  bids() {
    return MyBids.find();
  },
  hasBids() {
    return (MyBids.find().count() + PendingBids.find().count()) > 0;
  },
  names() {
    return Names.find({watched:true},{sort: {name: 1}});
  },
  active() {
    return Names.find({watched:true, mode: {$in: ['owned', 'auction', 'reveal']}},{sort: {registrationDate: 1}});
  },
  inactive() {
    return Names.find({watched:true, mode: {$in: ['not-yet-available', 'open']}},{sort: {availableDate: 1}});  },
  watchesNames() {
    return Names.find({watched:true}).count() > 0;
  }, 
  sortedByDate(){
    return LocalStore.get('sort-date') === true;
  }
})

Template['view_names'].events({
  'click .export-bids': function(e) {
    EthElements.Modal.show('modals_backup');
    e.preventDefault();
  },
  'click .import-bids': function(e) {
    EthElements.Modal.show('modals_restore');
    e.preventDefault();
  },
  'click .toggle-sort': function(e) {
    e.preventDefault();
    LocalStore.set('sort-date', !LocalStore.get('sort-date'))
  }
})

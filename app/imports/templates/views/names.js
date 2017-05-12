Template['view_names'].helpers({
  bids() {
    return MyBids.find();
  },
  hasBids() {
    return MyBids.find().count() > 0;
  },
  names() {
    if (LocalStore.get('sort-date')) {
      return Names.find({watched:true},{sort: {availableDate: 1}});
    } else {
      return Names.find({watched:true},{sort: {name: 1}});
    }
  },
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

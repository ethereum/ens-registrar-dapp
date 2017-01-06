Template['layout_router'].onCreated(function() {
  Session.set('view', 'layout_main')
})

Template['layout_router'].events({
  'click .home': function() {
    Session.set('view', 'layout_main');
  },
  'click .bids': function() {
    Session.set('view', 'view_bids');
  }
})

Template['layout_router'].helpers({
  view() {
    return Session.get('view')
  }  
})
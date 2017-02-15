
Template['layout_header'].onRendered(function() {

  Tracker.autorun(function(){
    const name = Session.get('name');
    if (name) {
      document.getElementById('search-input').value = Session.get('name');
    }
  });

 
})

Template['layout_header'].events({
  'keyup #search-input': function(event, template) {
    if (template.lookupTimeout) {
      clearTimeout(template.lookupTimeout);
    }
    template.lookupTimeout = setTimeout(function() {
      Session.set('searched', event.target.value);
    }, 200);
  }, 
  'click .main-title': function(event, template) {
    Session.set('searched', '');
    template.$('#search-input').val('');
  }
})

Template['layout_header'].helpers({
  'backgroundDataUrl': function(){
    var searched = Session.get('name');
    if (searched && searched.length > 0) {
      // generate a pattern for the name
      return GeoPattern.generate(searched).toDataUrl();
    } else {
      // Otherwise generate a new pattern everyday
      return GeoPattern.generate(new Date().toISOString().substr(0,10)).toDataUrl();
    }
  },
  'disabled': function() {
    return (Session.get('name') && Session.get('name').length > 0 && Session.get('name').length < 7) ? 'invalid-name' : '';
  }
});

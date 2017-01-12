var StringPrep = require('node-stringprep').StringPrep;
var NamePrep = new StringPrep('nameprep');

Template['layout_header'].events({
  'keyup #search-input': function(event) {
      Session.set('searched', NamePrep.prepare(event.target.value));
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
  'returnedName': function() {
    window.location.hash = Session.get('name');
    return Session.get('name');
  },
  'disabled': function() {
    return (Session.get('name').length > 0 && Session.get('name').length < 7) ? 'invalid-name' : '';
  }
});

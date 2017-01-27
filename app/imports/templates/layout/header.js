var StringPrep = require('node-stringprep').StringPrep;
var NamePrep = new StringPrep('nameprep');

Template['layout_header'].events({
  'keyup #search-input': function(event, template) {
    if (template.lookupTimeout) {
      clearTimeout(template.lookupTimeout);
    }
    template.lookupTimeout = setTimeout(function() {
      Session.set('searched', NamePrep.prepare(event.target.value));
    }, 400);
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
    var name = Session.get('name');
    if (name) window.location.hash = name;
    return name;
  },
  'disabled': function() {
    return (Session.get('name') && Session.get('name').length > 0 && Session.get('name').length < 7) ? 'invalid-name' : '';
  }
});

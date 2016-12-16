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
    if (!searched) {
      return 'none';
    }
    return GeoPattern.generate(searched).toDataUrl();
  },
  'returnedName': function() {
    return Session.get('name');
  }
});

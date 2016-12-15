var StringPrep = require('node-stringprep').StringPrep;
var NamePrep = new StringPrep('nameprep');

Template['layout_header'].events({
  'keyup #search-input': function(event) {
      Session.set('searched', NamePrep.prepare(event.target.value));
  }
})

Template['layout_header'].helpers({
  backgroundDataUrl() {
    var searched = Session.get('searched');
    if (!searched) {
      return 'none';
    }
    return GeoPattern.generate(searched).toDataUrl();
  },
  searched() {
    return Session.get('searched');
  }
});

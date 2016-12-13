Template['layout_header'].events({
  'keyup #search-input': function(event) {
      Session.set('searched', event.target.value);
  }
})

Template['layout_header'].helpers({
  'backgroundDataUrl': function(){
    var searched = Session.get('searched');
    if (!searched) {
      return 'none';
    }
    return GeoPattern.generate(searched).toDataUrl();
  }
});

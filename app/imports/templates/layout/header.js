
Template['layout_header'].onRendered(function() {
  let name, searched;
  var template = this;

  this.autorun(function() {
    searched = Session.get('searched');
    name = Session.get('name');

    if(searched !== name) 
      document.getElementById('search-input').value = Session.get('searched');

    if (searched && searched.length > 0) {
      // generate a pattern for the name
      TemplateVar.set(template, 'header-bg', GeoPattern.generate(searched).toDataUrl());
    } else {
      // Otherwise generate a new pattern everyday
      TemplateVar.set(template, 'header-bg', GeoPattern.generate(new Date().toISOString().substr(0,10)).toDataUrl());
    }

    console.log('name-invalid', name, (name && name.length > 0 && name.length < 7));
    TemplateVar.set(template, 'name-invalid', (name && name.length > 0 && name.length < 7));
  })

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
    Session.set('name', '');
    template.$('#search-input').val('');

    window.location.hash = '';
  }
})

Template['layout_header'].helpers({
  'backgroundDataUrl': function(){
    return TemplateVar.get('header-bg');
  },
  'disabled': function() {
    return TemplateVar.get('name-invalid') ? 'invalid-name' : '';
  }
});

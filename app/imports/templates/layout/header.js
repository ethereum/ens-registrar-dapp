
Template['layout_header'].onRendered(function() {
  let name, searched;
  const template = this;

  this.autorun(function() {
    if (!Session.get('searched')) 
      Session.set('searched', window.location.hash.replace('#',''));

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

    TemplateVar.set('name-invalid', (searched && searched.length > 0 && searched.length < 7));
  })

})

Template['layout_header'].events({
  'input #search-input': function(event, template) {
    event.target.value = event.target.value.replace(/[\.\s\_\/\\\@]*/g,'').toLowerCase();
    if (template.lookupTimeout) {
      clearTimeout(template.lookupTimeout);
    }
    template.lookupTimeout = setTimeout(function() {
      Session.set('searched', event.target.value);
    }, 200);
  }, 
  'click #search-input': function(event, template) {
    event.stopPropagation();
  }, 
  'click header': function(event, template) {
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

Template['components_nameStatus'].onCreated(function() {
    var template = this;

    this.autorun(function() {
      var searched = Session.get('searched');

      if (searched) {
        //Look up name on 'searched' change.
        registrar.getEntry(searched, (err, entry) => {
          if(!err && entry) {
            TemplateVar.set(template, 'nameInfo', {
              name: entry.name + '.eth',
              entry
            })

            TemplateVar.set('name', entry.name);
            TemplateVar.set('status', 'status-' + entry.mode);
            Session.set('name', entry.name);
          }
        });
      }
    })
});


Template['components_nameStatus'].helpers({
    searched() {
      return Session.get('searched');
    },
    fullName() {
      //searched + .eth
      return TemplateVar.get('nameInfo').name
    }
});


Template['components_nameStatus'].onCreated(function() {
    var template = this;

    this.autorun(function() {
      Session.get('searched');
      var searched = Session.get('searched');

      console.log('autorun', searched);
      if (searched) {
        //Look up name on 'searched' change.
        registrar.getEntry(searched, (err, entry) => {
          if(!err && entry) {
            console.log('get entry', entry);
            TemplateVar.set(template, 'nameInfo', {
              name: entry.name + '.eth',
              entry
            })

            console.log('entry:', entry);

            TemplateVar.set('name', entry.name);
            TemplateVar.set('status', 'status-' + entry.mode);
            Session.set('name', entry.name);

          }
        });
      }
      

      // lookUp();
    })
    // this.updateStatusInterval = Meteor.setInterval(lookUp, 1 * 1000);
});

Template['components_nameStatus'].onDestroyed(function() {
    Meteor.clearInterval(this.updateStatusInterval);
});

Template['components_nameStatus'].helpers({
    searched() {
      return Session.get('searched');
    },
    name() {
      return TemplateVar.get('nameInfo').name;
    },
    state() {
      return TemplateVar.get('nameInfo');
    }
});

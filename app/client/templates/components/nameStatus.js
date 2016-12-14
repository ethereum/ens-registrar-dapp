Template['components_nameStatus'].onCreated(function() {
    var template = this;
    function lookUp() {
      var searched = Session.get('searched');
      if (!searched) {
        return;
      }
      //Two tasks: get address, and get entry.
      let tasks = 2;
      let address = null;
      let entry = null;
      function taskDone() {
        tasks--;
        if (tasks === 0) {
          TemplateVar.set(template, 'state', {
            name: searched + '.eth',
            address,
            entry
          })
        }
      }
      ens.resolver(searched + '.eth', (err, res) => {
        if (!err) {
          address = res.addr();
        }
        taskDone();
      });
      registrar.getEntry(searched, (err, res) => {
        if(!err) {
          entry = res;
        }
        taskDone();
      });
    }
    lookUp();
    this.autorun(function() {
      Session.get('searched');
      //Look up name on 'searched' change.
      lookUp();
    })
    this.updateStatusInterval = Meteor.setInterval(lookUp, 1 * 1000);
});

Template['components_nameStatus'].onDestroyed(function() {
    Meteor.clearInterval(this.updateStatusInterval);
});

Template['components_nameStatus'].helpers({
    searched() {
      return Session.get('searched');
    },
    state() {
      return TemplateVar.get('state');
    }
});

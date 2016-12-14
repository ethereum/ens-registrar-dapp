import getNameStatus from '/imports/get-name-status';

Template['components_nameStatus'].onCreated(function() {
    var template = this;
    function lookUp() {
      var searched = Session.get('searched');
      if (!searched) {
        return;
      }
      getNameStatus(searched, (err, res) => {
        TemplateVar.set(template, 'state', res);
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

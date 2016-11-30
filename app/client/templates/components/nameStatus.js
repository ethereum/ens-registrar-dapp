Template['components_nameStatus'].onCreated(function() {
    // status update interval
    var self = this;
    Session.set('status', 'Looking up status...');
    function lookUp() {
      ens.resolver(self.data.name, (err, res) => {
          Session.set('status', err ?
            String(err.message || err) :
            String(res)
          );
      });
    }
    lookUp();
    this.updateStatus = Meteor.setInterval(lookUp, 1 * 1000);
});

Template['components_nameStatus'].onDestroyed(function() {
    // clear the status update interval
    Meteor.clearInterval(this.updateStatus);
});

Template['components_nameStatus'].helpers({
    'status': function(){
		    return Session.get('status');
    },
});

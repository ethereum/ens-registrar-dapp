Template['components_nameStatus'].onCreated(function() {
    var template = this;
    TemplateVar.set('status', 'Looking up status...');
    function lookUp() {
      ens.resolver(template.data.name, (err, res) => {
          TemplateVar.set(template, 'status', err ?
            String(err.message || err) :
            String(res)
          );
      });
    }
    lookUp();
    this.updateStatusInterval = Meteor.setInterval(lookUp, 1 * 1000);
});

Template['components_nameStatus'].onDestroyed(function() {
    Meteor.clearInterval(this.updateStatusInterval);
});

Template['components_nameStatus'].helpers({
    'status': function(){
		    return TemplateVar.get('status');
    },
});

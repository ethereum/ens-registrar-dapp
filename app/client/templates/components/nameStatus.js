import getNameStatus from '/imports/get-name-status';

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

            

            if (searched.length <= 7) {
              // If name is short, check if it has been bought
              if (entry.status == 0) {
                TemplateVar.set('status', 'status-invalid');
              } else {
                TemplateVar.set('status', 'status-can-invalidate');
              }
            } else {
              // If name is of valid length
              if (entry.status == 0) {
                // Not an auction yet
                TemplateVar.set('status', 'status-open');
              } else if (entry.status == 1) {

                let now = new Date();
                let registration = new Date(entry.registrationDate*1000);
                let hours = 60*60*1000;

                if ((registration - now) > 24 * hours ) {
                  // Bids are open
                  TemplateVar.set('status', 'status-auction');
                } else if (now < registration && (registration - now) < 24 * hours ) {
                  // reveal time!
                  TemplateVar.set('status', 'status-reveal');
                } else if (now > registration && (now - registration) < 24 * hours ) {
                  // finalize now
                  TemplateVar.set('status', 'status-finalize');
                } else {
                  // finalize now but can open?
                  TemplateVar.set('status', 'status-finalize-open');
                }


              } else if (entry.status == 2) {
                TemplateVar.set('status', 'status-owned');
              } 

            } 

            
            
            
            //<!--  Open, Auction, Owned, Forbidden  -->

            // console.log('name', TemplateVar.get('nameInfo'));

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
    state() {
      return TemplateVar.get('nameInfo');
    }
});

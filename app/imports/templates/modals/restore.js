function checkBids(data) {
  if (Array.isArray(data)) {
    var bids = data;
  } else if (typeof data == 'object') {
    var bids = data.MyBids;
  } else {
    throw 'Unexpected format';
  }  

  if (data.length == 0) {
    throw 'No bids found on file';
  }
  bids.forEach(bid => {
    if (!bid._id) {
      throw 'Expected all bids to have an _id property';
    }
  })
}

Template['modals_restore'].onCreated(function() {
  this.allBids = new ReactiveVar();
  this.newBids = new ReactiveVar();
  this.pendingBids = new ReactiveVar();
  this.fileError = new ReactiveVar();
})

Template['modals_restore'].onRendered(function() {
  var template = this;
  function handleFiles() {
    let file = this.files[0];
    var reader = new FileReader();
    template.fileError.set(null)
    template.allBids.set(null)
    template.newBids.set(null)
    template.pendingBids.set(null)
    reader.onload = function(e) {
      let bids, data, pendingBids;
      try {
        data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          bids = data; 
        } else if (typeof data == 'object' && data.MyBids) {
          bids = data.MyBids; 
          pendingBids = data.PendingBids; 
        } else {
          throw 'Unexpected format';
        }      
      } catch(e) {
        template.fileError.set('Can\'t parse file. ' + e);
       return;
     }
     try {
       if (pendingBids) {
        checkBids(bids.concat(pendingBids));
        } else {
        checkBids(bids);
        }
     } catch(e) {
       template.fileError.set(e);
     }
     template.allBids.set(bids);
     template.newBids.set(
       bids.filter(bid => !MyBids.findOne({ "_id": bid._id }))
     );
     if (pendingBids) {
      template.pendingBids.set(
        pendingBids.filter(bid => !PendingBids.findOne({ "_id": bid._id }))
      );     
     }
    };
    reader.readAsText(file);
  }
  
  var inputElement = document.getElementById("restore-input");
  inputElement.addEventListener("change", handleFiles, false);
})

Template['modals_restore'].events({
  'click .import': function(e, template) {
    let newBids = template.newBids.get();
    let pendingBids = template.pendingBids.get();
    try {
      let insertCount = 0;
      newBids.forEach(bid => {
        // Check not exists again just in case
        if (!MyBids.findOne({ "_id": bid._id })) {
          MyBids.insert(bid);
          insertCount++;
        };
        console.log('bid inserted', bid)
        Names.upsert({name: bid.name}, { $set: {fullname: bid.name + '.eth', watched: true}});

      })
      if (pendingBids) {
        pendingBids.forEach(bid => {
          // Check not exists again just in case
          if (!PendingBids.findOne({ "_id": bid._id })) {
            PendingBids.insert(bid);
            insertCount++;
          };
          console.log('bid inserted', bid)
          Names.upsert({name: bid.name}, { $set: {fullname: bid.name + '.eth', watched: true}});

        })      
      }
      alert(`${insertCount} bids successfully imported.`);
      
      // Reset file input
      let input = document.getElementById("restore-input");
      input.type = '';
      input.type = 'file';
      
      //Reset state
      template.fileError.set(null)
      template.allBids.set(null)
      template.newBids.set(null)
    } catch(e) {
      alert('Error importing bids. ' + e);
    }
  }
})

Template['modals_restore'].helpers({
  fileIsLoaded() {
    if (Template.instance().pendingBids.get()) {
      return Template.instance().newBids.get() + Template.instance().pendingBids.get();
    } else {
      return Template.instance().newBids.get();
    }
  },
  newBidsCount() {
    if (Template.instance().pendingBids.get()) {
      return Template.instance().newBids.get().length + Template.instance().pendingBids.get().length;
    } else {
      return Template.instance().newBids.get().length;
    }
  },
  totalBids() {
    if (Template.instance().pendingBids.get()) {
      return Template.instance().allBids.get().length + Template.instance().pendingBids.get().length;
    } else {
      return Template.instance().allBids.get().length;
    }
  },
  fileError() {
    return Template.instance().fileError.get();
  },
  buttonDisabled() {
    let newBids = Template.instance().newBids.get();
    let pendingBids = Template.instance().pendingBids.get();
    if (pendingBids) {
      return !(newBids && (newBids.length + pendingBids.length) > 0);
    } else {
      return !(newBids && newBids.length > 0);
    }
  }
})
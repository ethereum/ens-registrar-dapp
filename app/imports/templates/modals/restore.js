function checkBids(bids) {
  if (!Array.isArray(bids)) {
    throw 'Expected an array.';
  }
  if (bids.length == 0) {
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
    reader.onload = function(e) {
      let bids;
      try {
        bids = JSON.parse(e.target.result); 
      } catch(e) {
        template.fileError.set('Can\'t parse file. ' + e);
       return;
     }
     try {
       checkBids(bids);
     } catch(e) {
       template.fileError.set(e);
     }
     template.allBids.set(bids);
     template.newBids.set(
       bids.filter(bid => !MyBids.findOne({ "_id": bid._id }))
     );
    };
    reader.readAsText(file);
  }
  
  var inputElement = document.getElementById("restore-input");
  inputElement.addEventListener("change", handleFiles, false);
})

Template['modals_restore'].events({
  'click .import': function(e, template) {
    let newBids = template.newBids.get();
    try {
      let insertCount = 0;
      newBids.forEach(bid => {
        // Check not exists again just in case
        if (!MyBids.findOne({ "_id": bid._id })) {
          MyBids.insert(bid);
          insertCount++;
        }
      })
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
    return Template.instance().allBids.get();
  },
  newBidsCount() {
    return Template.instance().newBids.get().length;
  },
  totalBids() {
    return Template.instance().allBids.get().length;
  },
  fileError() {
    return Template.instance().fileError.get();
  },
  buttonDisabled() {
    let newBids = Template.instance().newBids.get();
    return !newBids || newBids.length == 0;
  }
})
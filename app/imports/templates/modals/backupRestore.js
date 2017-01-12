import { ReactiveVar } from 'meteor/reactive-var';

Template['modals_backupRestore'].onCreated(function() {
  this.view = new ReactiveVar('backup');
})

Template['modals_backupRestore'].events({
  'click .backup-link': function(e, template) {
    template.view.set('backup');
  },
  'click .restore-link': function(e, template) {
    template.view.set('restore');
  }
})

Template['modals_backupRestore'].helpers({
  view() {
    return Template.instance().view.get();
  }
})

// BACKUP

Template['backup'].events({
  'click .dapp-block-button': function() {
    const filename = `ens-bids-backup_${new Date().toISOString()}.json`;
    const data = JSON.stringify(MyBids.find().fetch());
    
    //Download logic from http://stackoverflow.com/a/33542499/988367
    var blob = new Blob([data], {type: 'text/json'});
    var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;        
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
    
    //Do this on closing the window?
    //window.URL.revokeObjectURL(blob);
  }
})

// RESTORE

var GlobalNotification = {
  error(e) {
    alert(e.content)
  }
};

Template['restore'].onRendered(function() {
  
  function handleFiles() {
    let file = this.files[0];
    
    var reader = new FileReader();
    reader.onload = function(e) {
      let bids;
      try {
        bids = JSON.parse(e.target.result); 
      } catch(e) {
        GlobalNotification.error({
          content: 'Can\'t parse file: ' + e,
          duration: 5
       });
      }
      bids.forEach(function(bid) {
        if(!MyBids.findOne({ "_id": bid._id })) {
          MyBids.insert(bid);
        }
      });
    };
    reader.readAsText(file);
  }
  
  var inputElement = document.getElementById("restore-input");
  inputElement.addEventListener("change", handleFiles, false);
})


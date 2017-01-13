Template['modals_backup'].events({
  'click .download': function() {
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
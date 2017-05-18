Template['modals_backup'].events({
  'click .download': function() {
    const now = new Date().toISOString();
    const filename = `ens-bids-backup_${now}.json`;
    const data = {  About: { backupDate: now, mastersalt: LocalStore.get('mastersalt')}, 
                    MyBids: MyBids.find().fetch(), 
                    PendingBids: PendingBids.find().fetch() };
    
    //Download logic from http://stackoverflow.com/a/33542499/988367
    var blob = new Blob([JSON.stringify(data)], {type: 'text/json'});
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


Template['modals_backup'].helpers({
  bidAmount() {
    return PendingBids.find().count() + MyBids.find().count();
  }
});
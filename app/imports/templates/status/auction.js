import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-auction'].helpers({
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name}).count() > 0 ;
  },
  hasNode() {
    return LocalStore.get('hasNode');
  }
})


Template['aside-auction'].onCreated(function() {
  var template = this;
  setInterval(() => {  
    TemplateVar.set(template, 'revealDate', moment(template.data.entry.registrationDate * 1000 - 48 *60*60*1000));

  }, 500);
});


Template['aside-auction'].helpers({ 
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  revealDate() {
    var m = TemplateVar.get('revealDate');

    return m ? m.format('YYYY-MM-DD HH:mm') : null;
  }, 
  timeRemaining() {
    var m = TemplateVar.get('revealDate');

    if (m && m.diff(moment(), 'hours') > 48) {
      return Math.floor(m.diff(moment(), 'hours')/24) + ' days, ' + Math.floor(m.diff(moment(), 'hours')%24) + ' hours'
    } else if (m) {
        return Math.floor(m.diff(moment(), 'minutes')/60) + 'h ' + Math.floor(m.diff(moment(), 'minutes')%60) + 'm ' + Math.floor(m.diff(moment(), 'seconds')%60) + 's';
    } else {
      return false;
    }
  }
})

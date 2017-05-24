import Helpers from '/imports/lib/helpers/helperFunctions';

Template['status-auction'].onCreated(function() {
  var template = this;
  setInterval(() => {  
    const name = Names.findOne({name: Session.get('searched')}); 
    if (!name) return;

    var revealDate = new Date((name.registrationDate - 48*60*60 - 10*60) * 1000)
    var diffInMinutes = (revealDate - new Date())/(60*1000);    
    TemplateVar.set(template, 'outOfTime', diffInMinutes < 0);
  }, 1000);
});

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
    const name = Names.findOne({name: Session.get('searched')}); 
    if (!name) return;

    var revealDate = new Date((name.registrationDate - 48*60*60 - 10*60) * 1000) 
    TemplateVar.set(template, 'revealDate', revealDate);
  }, 1000);
});


Template['aside-auction'].helpers({ 
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  revealDate() {
    var m = moment(TemplateVar.get('revealDate'));
    return m ? m.format('YYYY-MM-DD HH:mm') : null;
  }, 
  timeRemaining() {
    var revealDate = TemplateVar.get('revealDate');
    if (!revealDate) return 'Loading..';

    var m = moment(revealDate);

    if (m && m.diff(moment(), 'hours') > 70) {
      return Math.round((m.diff(moment(), 'hours'))/24) + ' days';
    } else if (m && m.diff(moment(), 'hours') > 48) {
      return Math.floor((m.diff(moment(), 'hours'))/24) + ' days, ' + (m.diff(moment(), 'hours')%24) + ' hours';
    } else if (m && m.diff(moment(), 'seconds') < 1) {
      return 'Bids are closed';
    } else if (m) {
        return Math.floor(m.diff(moment(), 'minutes')/60) + 'h ' + Math.floor(m.diff(moment(), 'minutes')%60) + 'm ' + Math.floor(m.diff(moment(), 'seconds')%60) + 's';
    } else {
      return false;
    }
  }
})

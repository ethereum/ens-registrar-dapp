import { registrar } from '/imports/lib/ethereum';
import { updatePendingBids } from '/imports/lib/bids';

Template['components_nameStatus'].onCreated(function() {
  var template = this;
  TemplateVar.set('error', false);
  var timeout, timeoutName;

  function lookupName(name) {
    if (!name) {
      return;
    }
    try {
      registrar.getEntry(name, (err, entry) => {
        if(!err && entry) {
          TemplateVar.set(template, 'nameInfo', {
            name: entry.name + '.eth',
            entry
          })

          TemplateVar.set(template, 'name', entry.name);
          TemplateVar.set(template, 'status', 'status-' + entry.mode);
          TemplateVar.set(template, 'aside', 'aside-' + entry.mode);
          Session.set('name', entry.name);
          if (entry.name) {
            window.location.hash = entry.name;
          }
          if (entry.mode === 'auction') {
            updatePendingBids(entry.name);
          }

          // Since we grabbed this information, update the database
          if (timeoutName !== name){
            // To prevent too many writes, add a timer and only save to the database afger a few seconds
            clearTimeout(timeout);
            timeoutName = name;
            console.log('update name', name, entry.registrationDate);

            timeout = setTimeout(function() {
              Names.upsert({name: name}, {$set: {
                fullname: name + '.eth',
                mode: entry.mode, 
                registrationDate: entry.registrationDate, 
                value: entry.deed.balance ? Number(web3.fromWei(entry.deed.balance.toFixed(), 'ether')) : entry.value, 
                highestBid: entry.highestBid, 
                hash: entry.hash.replace('0x','').slice(0,12)
              }});

            }, 3000);
          };

          
            

        }
      });
    } catch(e) {
      TemplateVar.set(template, 'error', e);
    }
  }
  
  this.autorun(function() {
    var searched = Session.get('searched');
    TemplateVar.set(template, 'error', false);
    lookupName(searched);
  })
  
  setInterval(() => lookupName(Session.get('searched')), 1000);
});

Template['components_nameStatus'].events({
  'click .names a': function(e) {
    Session.set('searched', e.target.hash.slice(1));
    e.preventDefault();
  }
});

Template['components_nameStatus'].helpers({
    searched() {
      return Session.get('searched');
    },
    fullName() {
      //searched + .eth
      return TemplateVar.get('nameInfo').name
    }, 
    publicAuctions() {
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60;
      return Names.find({registrationDate: {$gt: revealDeadline}, name:{$gt: ''}},{sort: {registrationDate: -1}, limit: 100});
    }, 
    publicAuctionsAboutToExpire() {
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60;      
      return Names.find({registrationDate: {$gt: revealDeadline}, name:{$gt: ''}},{sort: {registrationDate: 1}, limit: 100});
    }, 
    knownNamesRegistered() {
      return Names.find({value: {$gt: 0}, name:{$gt: ''}},{sort: {registrationDate: -1}, limit: 100});
    }, 
    namesRegistered() {
      return Names.find({value: {$gt:0}}).count();
    }, 
    hasAuctions() {
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60;      
      return Names.find({registrationDate: {$gt: revealDeadline}, name:{$gt: ''}},{}).count() > 0;
    },
    averageValue() {
      var average = _.reduce(
          Names.find({value: {$gt:0.01}}).fetch(), function(memo,num) { 
            return memo + num.value; 
          }, 0);
      return Math.round(average*100)/100 ;
    }, 
    percentageDisputed() {
      return Math.round(100 - (100 * Names.find({value: {$gt:0.01}}).count() / Names.find({value: {$gt:0}}).count())) || 0;
    }
});

Template['aside-forbidden-can-invalidate'].helpers({
  value() {
    var val = Template.instance().data.entry.deed.balance;
    return web3.fromWei(val ? val.toFixed() : 0, 'ether');
  },
  invalidatorFee() {
    var val = Template.instance().data.entry.deed.balance;
    return web3.fromWei(val ? val.toFixed()/2 : 0, 'ether');
  }
})


Template['status-finalize'].helpers({
  owner() {
    return Template.instance().data.entry.deed.owner;
  },
  refund() {
    var deed = new BigNumber(Template.instance().data.entry.deed.balance);
    var value = new BigNumber(Template.instance().data.value || 10000000000000000);
    return web3.fromWei( deed.minus(value).toFixed(), 'ether');
  },
  registrationDate() {
    var date = new Date(Template.instance().data.entry.registrationDate * 1000);
    return date.toLocaleString();
  },
  renewalDate() {
    var years = 365 * 24 * 60 * 60 * 1000;
    var date = new Date(Template.instance().data.entry.registrationDate * 1000 + 2 * years);
    return date.toLocaleDateString();
  },
  highestBid() {
    var val = Template.instance().data.entry.highestBid;
    return web3.fromWei(val, 'ether');
  }
})

Template['status-reveal'].helpers({
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name}).count() > 0 ;
  }  
})


Template['aside-reveal'].helpers({ 
  registrationDate() {
    var m = moment(Template.instance().data.entry.registrationDate * 1000);

    return m.format('YYYY-MM-DD HH:mm');
  }, 
  timeRemaining() {
    var m = moment(Template.instance().data.entry.registrationDate * 1000);
    
    return Math.floor(m.diff(moment(), 'minutes')/60) + 'h ' + Math.floor(m.diff(moment(), 'minutes')%60) + 'm ' + Math.floor(m.diff(moment(), 'seconds')%60) + 's';
    
  },
  highestBid() {
    var val = Template.instance().data.entry.highestBid;
    return web3.fromWei(val, 'ether');
  }
})

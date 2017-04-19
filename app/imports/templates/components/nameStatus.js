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
          let prevInfo = TemplateVar.get(template, 'nameInfo');
          TemplateVar.set(template, 'loading', false);
          
          if (prevInfo 
            && prevInfo.name === entry.name + '.eth' 
            && prevInfo.entry.mode === entry.mode) {
              console.log('dont update')
              //don't update unless name and status changed
              return;
          }

          if (entry.mode == 'not-yet-available') {

            registrar.getAllowedTime(name, (err, timestamp) => {
              console.log('getAvailableTime! ', timestamp.toFixed());
              entry.availableDate = timestamp.toFixed();

              TemplateVar.set(template, 'nameInfo', {
                name: entry.name + '.eth',
                entry
              })
            });

          } else {

            TemplateVar.set(template, 'nameInfo', {
              name: entry.name + '.eth',
              entry
            })

          }

          TemplateVar.set(template, 'name', entry.name);
          TemplateVar.set(template, 'status', 'status-' + entry.mode);
          TemplateVar.set(template, 'aside', 'aside-' + entry.mode);
          
          console.timeEnd('lookupName');


          Session.set('name', entry.name);
          if (entry.name) {
            // if the name has changed, add it to the history
            if (window.location.hash !== '#' + name) {
              history.pushState(null, entry.name + '.eth', '#'+entry.name);
            }
            // add to the location bar
            window.location.hash = entry.name;

          }
          if (entry.mode === 'auction') {
            updatePendingBids(entry.name);
          }

          // Since we grabbed this information, update the database
          if (timeoutName !== name){
            // To prevent too many writes, add a timer and only save to the database after a few seconds
            clearTimeout(timeout);
            timeoutName = name;
            console.log('update name', name, entry);

            timeout = setTimeout(function() {
              if (name === Session.get('searched')) {
                Names.upsert({name: name}, {$set: {
                  fullname: name + '.eth',
                  mode: entry.mode, 
                  registrationDate: entry.registrationDate, 
                  value: entry.mode == 'owned' ? Number(web3.fromWei(entry.deed.balance.toFixed(), 'ether')) : 0, 
                  highestBid: entry.highestBid, 
                  hash: entry.hash.replace('0x','').slice(0,12)
                }});
              }

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
    TemplateVar.set(template, 'loading', true);
    console.time('lookupName');
    setTimeout(function() {
      console.log('timeout')
      TemplateVar.set(template, 'loading', false);
      console.timeEnd('lookupName');
    }, 10000);
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
      return Names.find({registrationDate: {$gt: revealDeadline}, name:{$gt: '', $regex: /^.{7,}$/}},{sort: {registrationDate: -1}, limit: 100});
    },
    showExpiring() {
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60;
      return Names.find({registrationDate: {$gt: revealDeadline}, name:{$gt: '', $regex: /^.{7,}$/}},{sort: {registrationDate: -1}, limit: 100}).count() > 100;
    }, 
    publicAuctionsAboutToExpire() {
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60;      
      return Names.find({registrationDate: {$gt: revealDeadline}, name:{$gt: '', $regex: /^.{7,}$/}},{sort: {registrationDate: 1}, limit: 100});
    }, 
    knownNamesRegistered() {
      return Names.find({registrationDate: {$lt: Math.floor(Date.now()/1000)}, mode: {$nin: ['open', 'forbidden']}, name:{$gt: ''}},{sort: {registrationDate: -1}, limit: 100});
    },
    toBecomeAvailableSoon() {
      return Names.find({availableDate: {$lt: Math.floor(Date.now()/1000) + 7 * 24 * 60 * 60}, mode: {$nin: ['auction', 'forbidden']}, name:{$gt: ''}},{sort: {availableDate: -1}, limit: 100});
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
      return Math.round(average*100/Names.find({value: {$gt:0.01}}).count())/100 || '--';
    }, 
    percentageDisputed() {
      return Math.round(100 - (100 * Names.find({value: {$gt:0.01}}).count() / Names.find({value: {$gt:0}}).count())) || 0;
    },
    canBeInvalidated(name) {
      return name.length < 7;
    },
    hasNode() {
      return LocalStore.get('hasNode');
    },
    showStats() {
      return Names.find({value: {$gt:0}}).count() > 50;
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
  },
  hasNode() {
    return LocalStore.get('hasNode');
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
  },
  hasNode() {
    return LocalStore.get('hasNode');
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
  },
  hasNode() {
    return LocalStore.get('hasNode');
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


Template['status-not-yet-available'].helpers({
  availableDate() {
    console.log('getAvailableDate: ', Template.instance().data.entry);    
    var date = new Date(Template.instance().data.entry.availableDate * 1000);
    return date.toLocaleString();  
  }
})


Template['aside-not-yet-available'].helpers({
  availableCountdown() {
    var m = moment(Template.instance().data.entry.availableDate * 1000);
    
    return Math.floor(m.diff(moment(), 'minutes')/(24*60)) + 'd ' + Math.floor(m.diff(moment(), 'minutes')/60)%60 + 'h ';
    
  }
})
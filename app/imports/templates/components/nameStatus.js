import { registrar, network } from '/imports/lib/ethereum';
import { updatePendingBids } from '/imports/lib/bids';

Template['components_nameStatus'].onRendered(function() {
  console.log('network?!', network);
  TemplateVar.set('network', network);

  if (network!= 'main') {
  EthElements.Modal.question({
    text: 'You are on the '+network+' network. Names owned this network are not valid on the mainchain',
    ok: true,
    cancel: false // simply show th cancel button and close the modal on click
  });

  }
  
})

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
            && prevInfo.entry.availableDate
            && prevInfo.entry.mode === entry.mode) {
              //don't update unless name and status changed
              return;
          }

          if (!entry.availableDate || entry.availableDate == 0) {
            registrar.getAllowedTime(name, (err, timestamp) => {
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
          
          // console.timeEnd('lookupName');

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

            timeout = setTimeout(function() {
              if (name === Session.get('searched')) {
                var value = entry.mode == 'owned' ? Math.max(Number(web3.fromWei(entry.value.toFixed(), 'ether')), 0.01) : 0;

                console.log('upsert', name);
                Names.upsert({name: name}, {$set: {
                  fullname: name + '.eth',
                  mode: entry.mode, 
                  registrationDate: entry.registrationDate, 
                  value: value, 
                  highestBid: entry.highestBid, 
                  availableDate: entry.availableDate ? Number(entry.availableDate) :  0,
                  hash: entry.hash.replace('0x','').slice(0,12),
                  owner: entry.mode == 'owned' ? entry.deed.owner : '',
                  deedBalance: Number(web3.fromWei(entry.deed.balance, 'ether'))
                }});
              }

            }, 1000);
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
    // console.time('lookupName');
    setTimeout(function() {
      // console.log('timeout')
      TemplateVar.set(template, 'loading', false);
      // console.timeEnd('lookupName');
    }, 10000);
    lookupName(searched);
  })
  
  setInterval(() => lookupName(Session.get('searched')), 10000);
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
      return Names.find({registrationDate: {$gt:0}, name:{$gt: '', $regex: /^.{7,}$/}, mode: {$nin: ['forbidden', 'not-yet-available']}},{sort: {registrationDate: -1}, limit: 48});
    },
    showExpiring() {
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60;
      return Names.find({registrationDate: {$gt: revealDeadline, $lt: revealDeadline + 24 * 60 * 60}, name:{$gt: '', $regex: /^.{7,}$/}},{sort: {registrationDate: 1}, limit: 48}).count() > 1;
    }, 
    publicAuctionsAboutToExpire() {
      // subtracts 10 minutes from the reveal deadline, for good measure
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60 + 10 * 60;      
      return Names.find({registrationDate: {$gt: revealDeadline, $lt: revealDeadline + 24 * 60 * 60}, name:{$gt: '', $regex: /^.{7,}$/}},{sort: {registrationDate: 1}, limit: 48});
    }, 
    knownNamesRegistered() {
      return Names.find({registrationDate: {$lt: Math.floor(Date.now()/1000)}, mode: {$nin: ['open', 'forbidden', 'not-yet-available']}, name:{$gt: ''}},{sort: {registrationDate: -1}, limit: 48});
    },
    namesRegistered() {
      return Names.find({value: {$gt:0}, mode: {$nin: ['open', 'forbidden', 'not-yet-available']}}).count() > 1;
    }, 
    hasAuctions() {
      var revealDeadline = Math.floor(new Date().getTime()/1000) + 48 * 60 * 60;      
      return Names.find({registrationDate: {$gt: revealDeadline}, name:{$gt: ''}},{}).count() > 0;
    },
    medianValue() {
      var disputedNames = Names.find({value: {$gt:0.01}}, {sort: {value: 1}}).fetch();
      if (!disputedNames) return '---';
      return Math.round(100*disputedNames[Math.floor(disputedNames.length/2)].value)/100;
    }, 
    percentageDisputed() {
      return Math.round(100 - (100 * Names.find({value: {$gt:0.01}}).count() / Names.find({value: {$gt:0}}).count())) || 0;
    },
    canBeInvalidated(name) {
      return name.length < 7;
    },
    recent(registrationDate) {
      // Check to see if it should be either on recently registered or started recently
      var hours = 60*60;
      var diff = Math.floor(new Date().getTime()/1000) - registrationDate;      
      return ((diff > 0 && diff < 3 * hours)|| (diff < 5*60-5*24*hours)) ? 'recent' : '';
    },
    hasNode() {
      return LocalStore.get('hasNode');
    },
    showStats() {
      return Names.find({value: {$gt:0}}).count() > 50;
    },
    isMainNetwork(){
      return TemplateVar.get('network') == 'main';
    }
});

Template['status-forbidden-can-invalidate'].helpers({
  hasNode() {
      return LocalStore.get('hasNode');
  }
})


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

Template['status-reveal'].events({
  'click .import-bids': function(e) {
    EthElements.Modal.show('modals_restore');
    e.preventDefault();
  }
})


Template['aside-reveal'].helpers({ 
  registrationDate() {
    if (Template.instance().data == null) return 'loading...';
    var m = moment(Template.instance().data.entry.registrationDate * 1000);
    return m.format('YYYY-MM-DD HH:mm');
  }, 
  timeRemaining() {
    if (Template.instance().data == null) return '--h --m';
    var m = moment(Template.instance().data.entry.registrationDate * 1000);
    return Math.floor(m.diff(moment(), 'minutes')/60) + 'h ' + Math.floor(m.diff(moment(), 'minutes')%60) + 'm ' + Math.floor(m.diff(moment(), 'seconds')%60) + 's';
    
  },
  highestBid() {
    if (Template.instance().data == null) return '--';
    var val = Template.instance().data.entry.highestBid;
    return web3.fromWei(val, 'ether');
  },
  secondHighestBid() {
    if (Template.instance().data == null) return '--';
    var val = Template.instance().data.entry.value;
    return web3.fromWei(val, 'ether');
  }
})


Template['status-not-yet-available'].helpers({
  availableDate() {
    // console.log('getAvailableDate: ', Template.instance().data.entry); 
    if (Template.instance().data == null) return 'loading...';

    var m = moment(Template.instance().data.entry.availableDate * 1000);
    return m.format('MMMM Do YYYY, HH:mm'); // April 28th 2017, 12:26:11 pm
  }
})


Template['aside-not-yet-available'].helpers({
  availableCountdown() {
    if (Template.instance().data == null) return '--h --m';

    var m = moment(Template.instance().data.entry.availableDate * 1000);
    if (m.diff(moment(), 'days') > 1)
      return Math.floor(m.diff(moment(), 'minutes')/(24*60)) + ' days ' + Math.floor(m.diff(moment(), 'minutes')/60)%24 + ' hours';
    else if (m.diff(moment(), 'hours') >= 1)
      return Math.floor(m.diff(moment(), 'minutes')/60) + 'h ';
    else
      return 'less than an hour';

  }
})
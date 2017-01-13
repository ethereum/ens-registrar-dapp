import { registrar } from '/imports/lib/ethereum';

Template['components_nameStatus'].onCreated(function() {
  var template = this;
  TemplateVar.set('error', false);
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
        }
      });
    } catch(e) {
      TemplateVar.set(template, 'error', e);
    }
  }
  
  this.autorun(function() {
    var searched = Session.get('searched');
    TemplateVar.set(template, 'error', false);
      //Look up name on 'searched' change.
    lookupName(searched);
  })
  
  setInterval(() => lookupName(Session.get('searched')), 1000);
});


Template['components_nameStatus'].helpers({
    searched() {
      return Session.get('searched');
    },
    fullName() {
      //searched + .eth
      return TemplateVar.get('nameInfo').name
    }
});

Template['aside-can-invalidate'].helpers({
  value() {
    var val = Template.instance().data.entry.deed.balance;
    return web3.fromWei(val.toFixed(), 'ether');
  },
  invalidatorFee() {
    var val = Template.instance().data.entry.deed.balance;
    return web3.fromWei(val.toFixed()/2, 'ether');
  }
})

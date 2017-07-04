import { ens } from '/imports/lib/ethereum';

function validateName(claimedAddr, name, cb) {
  // Uses owner instead of addr()

  ens.resolver(name, (err, res) => {
    // if (err) {
    //   return cb(err);
    // }

    if (res) {
      // If there's a resolver, check addr()
      res.addr((err, actualAddr) => {
        if (err) {
          return cb(err);
        }
        cb(null, claimedAddr == actualAddr);
      });
    } else {
      // If there's no resolver set, check owner of name
      ens.owner(name, (err, actualAddr) => {
        if (err) {
          return cb(err);
        }
        cb(null, claimedAddr == actualAddr);
      });    
    }
    
  });

  
}

Template['components_address'].onCreated(function() {
  const template = Template.instance();
  web3.eth.getAccounts((err, accounts) => {
    if (!err && accounts && accounts.length > 0) {
      TemplateVar.set(template, 'accounts', accounts);
    }
  })   
  template.autorun(() => {
    const addr = Template.currentData().addr;
    TemplateVar.set(template, 'name', null);
    if (!addr) {
      return;
    }
    ens.reverse(addr, (err, resolver) =>{
      if (!err && resolver.name) {
        resolver.name((err, name) => {

          validateName(addr, name, (err, isValid) => {
            if (!err && isValid) {
              TemplateVar.set(template, 'name', name);
            }
          });
        });
      }
    })
  })
  
})

Template['components_address'].helpers({
  hasName() {
    return TemplateVar.get('name') && TemplateVar.get('name').length > 0 ? 'has-name' : '';
  },
  mine() {
    var accounts = TemplateVar.get('accounts')
    if (!accounts) return;    
    return accounts.indexOf(Template.instance().data.addr) > -1;
  },
  name() {
    return TemplateVar.get('name');
  },
  addrHead() {
    let address = Template.instance().data.addr || '0x0000000000000000000000000000000000000000'
    return address.slice(2,-8)
  },
  addrTail() {
    let address = Template.instance().data.addr || '0x0000000000000000000000000000000000000000'    
    return address.slice(-8)
  }
})


Template['components_address'].events({
  'click .address': function(el, template) {

    if (window.getSelection && document.createRange) {
          var sel = window.getSelection();
          var range = document.createRange();
          range.selectNodeContents(el.currentTarget);
          sel.removeAllRanges();
          sel.addRange(range);
      } else if (document.selection && document.body.createTextRange) {
          var textRange = document.body.createTextRange();
          textRange.moveToElementText(el.currentTarget);
          textRange.select();
      }    
  
  }
});
/*


    */
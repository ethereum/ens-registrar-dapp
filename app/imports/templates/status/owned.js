import { ens, registrar, network } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

let publicAddrResolver;

function getPublicAddrResolver() {
  let address;
  switch(network) {
    case 'ropsten': address = '0x4c641fb9bad9b60ef180c31f56051ce826d21a9a'; break;
    default: return null;
  }
  if (!publicAddrResolver) {
    publicAddrResolver = web3.eth.contract([{"constant":true,"inputs":[{"name":"node","type":"bytes32"},
      {"name":"contentType","type":"uint256"}],"name":"ABI","outputs":[{"name":"","type":"uint256"},
      {"name":"","type":"bytes"}],"payable":false,"type":"function"},{"constant":true,"inputs":
      [{"name":"node","type":"bytes32"}],"name":"addr","outputs":[{"name":"ret","type":"address"}],
      "payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},
      {"name":"kind","type":"bytes32"}],"name":"has","outputs":[{"name":"","type":"bool"}],
      "payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},
      {"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"name":"setABI","outputs":[],"payable":false,"type":"function"},
      {"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"name","outputs":[{"name":"ret","type":"string"}],
      "payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"name","type":"string"}],
      "name":"setName","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},
      {"name":"addr","type":"address"}],"name":"setAddr","outputs":[],"payable":false,"type":"function"},
      {"inputs":[{"name":"ensAddr","type":"address"}],"payable":false,"type":"constructor"},{"payable":false,"type":"fallback"},
      {"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"a","type":"address"}],
      "name":"AddrChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},
      {"indexed":false,"name":"name","type":"string"}],"name":"NameChanged","type":"event"}]).at(address);
  }
  return publicAddrResolver;
}

Template['status-owned'].onCreated(function() {
  
  TemplateVar.set(this, 'owner', null);
  TemplateVar.set(this, 'address', null);
  TemplateVar.set(this, 'content', null);
  TemplateVar.set(this, 'hasSetResolver', false);

  this.autorun(() => {
    const {name, entry} = Template.currentData();

    TemplateVar.set(this, 'entryData', entry);
    ens.owner(name, (err, res) => {
      if (!err) {
        TemplateVar.set(this, 'owner', res);
      }
    });
    ens.resolver(name, (err, res) => {
      if (err) {
        return;
      }
      TemplateVar.set(this, 'hasSetResolver', true);
      res.addr((err, address) => {
        if (!err) {
          TemplateVar.set(this, 'address', address);
        }
      });
      res.content((err, content) => {
        if (!err) {
          TemplateVar.set(this, 'content', content);
        }
      })
    });
  })
});

Template['status-owned'].helpers({
  records() {
    return {
      addr: TemplateVar.get('address'),
      content: TemplateVar.get('content')
    };
  },
  owner() {
    return TemplateVar.get('owner')
  },
  hasOwner() {
    return Number(TemplateVar.get('owner')) > 0;
  },
  deedOwner() {
    return TemplateVar.get('entryData').deed.owner;
  },
  isMine() {
    const owner = TemplateVar.get('owner');
    return web3.eth.accounts.filter((acc) => acc == owner).length > 0;
  },
  registrationDate() {
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000);
    return date.toISOString().slice(0,10);
  },
  releaseDate() {
    var releaseDate = new Date((TemplateVar.get('entryData').registrationDate + 365 * 24 * 60 * 60) * 1000);
    return releaseDate.toISOString().slice(0,10);
  },
  canRelease() {
    var releaseDate = new Date((TemplateVar.get('entryData').registrationDate + 365 * 24 * 60 * 60) * 1000);

    return Date.now() > releaseDate;
  },
  finalValue() {
    var val = TemplateVar.get('entryData').value;
    return Math.max(web3.fromWei(val.toFixed(), 'ether'), 0.01);
  },
  noBids() {
    var val = TemplateVar.get('entryData').value;
    return val.toFixed() <= 10000000000000000;
  },
  renewalDate() {
    var years = 365 * 24 * 60 * 60 * 1000;
    var date = new Date(TemplateVar.get('entryData').registrationDate * 1000 + 2 * years);
    return date.toISOString().slice(0,10);
  },
  highestBid() {
    var val = TemplateVar.get('entryData').highestBid;
    return web3.fromWei(val, 'ether');
  },
  content() {
    return TemplateVar.get('content') == '0x' ? 'not set' : TemplateVar.get('content') ;
  },
  transferring() {
    return TemplateVar.get('transferring');
  },
  releasing() {
    return TemplateVar.get('releasing');
  },
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name, revealed: false});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name, revealed: false}).count() > 0 ;
  },
  hasNode() {
    return LocalStore.get('hasNode');
  },
  needsFinalization() {
    var entry = TemplateVar.get('entryData');
    var owner = TemplateVar.get('owner');
    return owner != entry.deed.owner;
  },
  refund() {
    var deed = new BigNumber(Template.instance().data.entry.deed.balance);
    var value = new BigNumber(Template.instance().data.value || 10000000000000000);
    return web3.fromWei( deed.minus(value).toFixed(), 'ether');
  }
})

Template['status-owned'].events({
  'click .transfer': function(e, template) {
    const owner = TemplateVar.get('owner');
    const newOwner = TemplateVar.getFrom('.transfer-section .dapp-address-input', 'value');
    const name = template.data.entry.name;
    if (!newOwner) {
      GlobalNotification.error({
          content: 'No address chosen',
          duration: 3
      });
      return;
    }
    TemplateVar.set(template, 'transferring', true);
    registrar.transfer(name, newOwner, { from: owner, gas: 300000 },
      Helpers.getTxHandler({
        onSuccess: () => GlobalNotification.warning({
          content: 'Transfer completed',
          duration: 5
      }),
        onDone: () => TemplateVar.set(template, 'transferring', false),
        onError: () => {
          GlobalNotification.error({
            content: 'Could not transfer name',
            duration: 5
          });
          TemplateVar.set(template, 'releasing', false);
      }
      })
    );
  },
  'click .release': function(e, template) {
    const owner = TemplateVar.get('owner');
    const name = template.data.entry.name;

    TemplateVar.set(template, 'releasing', true);
    registrar.releaseDeed(name, { from: owner, gas: 300000 },
      Helpers.getTxHandler({
        onSuccess: () => GlobalNotification.warning({
          content: 'Name released',
          duration: 5
      }),
        onDone: () => TemplateVar.set(template, 'releasing', false),
        onError: () => {
          GlobalNotification.error({
            content: 'Could not release name',
            duration: 5
          });
          TemplateVar.set(template, 'releasing', false);
      }
    })
    );
  },
  /*
    This would point the name to a public resolver,
    which supports the addr record type.
  */
  'click .set-resolver': function(e, template) {
    const owner = TemplateVar.get('owner');
    const fullname = template.data.name;
    const publicResolver = getPublicAddrResolver();
    const newOwner = TemplateVar.getFrom('.transfer-section .dapp-address-input', 'value');
    if (!publicResolver) {
      GlobalNotification.error({
        content: `Public resolver not found on ${network} network.`,
        duration: 5
      });
      return;
    }
    TemplateVar.set('settingResolver', true);
    ens.setResolver(fullname, publicResolver.address, {from: owner, gas: 300000},
      Helpers.getTxHandler({
        onSuccess: () => Helpers.refreshStatus(),
        onDone: () => TemplateVar.set(template, 'settingResolver', false)
      })
    );
  },
  'click .edit-addr': function(e, template) {
    TemplateVar.set('editingAddr', true);
  },
  'click .cancel-edit-addr': function(e, template) {
    TemplateVar.set('editingAddr', false);
  },
  'click .set-addr': function(e, template) {
    const owner = TemplateVar.get('owner');
    const fullname = template.data.name;
    const newAddr = TemplateVar.getFrom('.addr-record .dapp-address-input', 'value');
    const publicResolver = getPublicAddrResolver();
    if (!publicResolver) {
      GlobalNotification.error({
        content: `Public resolver not found on ${network} network.`,
        duration: 5
      });
      return;
    }
    TemplateVar.set('settingAddr', true)
    publicResolver.setAddr(ens.namehash(fullname), newAddr, {from: owner, gas: 300000}, 
      Helpers.getTxHandler({
        onSuccess: () => Helpers.refreshStatus(),
        onDone: () => TemplateVar.set(template, 'settingAddr', false)
      })
    )
  }
});

Template['aside-owned'].helpers({
  finalValue() {
    var val = Number(Template.instance().data.entry.value);
    return Math.max(web3.fromWei(val, 'ether'), 0.01);
  }  
})

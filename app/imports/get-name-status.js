var ENS = require('ethereum-ens');
var Registrar = require('eth-registrar-ens');

var ens = new ENS(web3, '0x112234455c3a32fd11230c42e7bccd4a84e02010');
var registrar = new Registrar(web3, ens.owner('eth'), 7, 'eth', ens.registry.address);

export default function getNameStatus(name, callback) {
  //Two tasks: get address, and get entry.
  let tasks = 2;
  let address = null;
  let entry = null;
  function taskDone() {
    tasks--;
    if (tasks === 0) {
      callback(null, {
        name: name + '.eth',
        address,
        entry
      })
    }
  }
  ens.resolver(name + '.eth', (err, res) => {
    if (!err) {
      address = res.addr();
    }
    taskDone();
  });
  registrar.getEntry(name, (err, res) => {
    if(!err) {
      entry = res;
    }
    taskDone();
  });
}

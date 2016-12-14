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

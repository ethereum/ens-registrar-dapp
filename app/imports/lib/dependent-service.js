
module.exports = function dependentService({checker, starter, dependsOn, interval=800} = {}) {
  var listeners = [],
    lastStatus,
    starting = false,
    checkIntervalID;

  function checkStatus() {
    checker((err, ok) => {
      ok = !err && ok;
      listeners.forEach(listener => listener({ok, starting}))
      if (!ok && !starting) {
        starting = true;
        starter((err) => {
          if (!err) {
            starting = false;
          }
        })
      }
    })
  }

  return {
    listenStatus(handler) {
      listeners.push(handler);
    },
    stopChecking() {
      clearInterval(checkIntervalID)
    },
    startChecking() {
      checkIntervalID = setInterval(checkStatus, interval)
      checkStatus();
    }
  }
}

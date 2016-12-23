
module.exports = function dependentService({checker, starter, dependsOn, interval=800} = {}) {
  var listeners = [],
    lastStatus,
    starting = false,
    checkIntervalID,
    requiredServiceOk = false;

  function startService() {
    starting = true;
    starter((err) => {
      if (!err) {
        starting = false;
      }
    })
  }

  if (dependsOn) {
    dependsOn.listenStatus(status => {
      if (status.ok && !requiredServiceOk) {
        //required service has just become ok
        startService();
      }
      requiredServiceOk = status.ok;
    });
  } else {
    requiredServiceOk = true;
  }

  function checkStatus() {
    if (!requiredServiceOk) {
      listeners.forEach(listener => listener({ok: false, starting}))
      return;
    }
    checker((err, ok) => {
      ok = !err && ok && !starting;
      listeners.forEach(listener => listener({ok, starting}))
      if (!ok) {
        startService();
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

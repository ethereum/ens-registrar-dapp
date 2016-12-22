var test = require('tape');

test('dependent-service: auto-start', (t) => {
  t.plan(3);
  var dependentService = require('../imports/lib/dependent-service');
  var serviceAisOn = true;
  var starterWasCalled = false;
  var serviceA = dependentService({
    checker: (cb) => cb(null, serviceAisOn),
    starter: (onStarted) => {
      serviceAisOn = true;
      starterWasCalled = true;
      onStarted();
    },
    interval: 50
  });
  setTimeout(() => {
    t.notOk(starterWasCalled);
    //turn it off
    serviceAisOn = false;
    setTimeout(() => {
      t.ok(starterWasCalled);
      t.ok(serviceAisOn);
      t.end();
      serviceA.stopChecking();
    }, 110)
  }, 110)
});

var test = require('tape');

test('dependent-service: auto-start', (t) => {
  t.plan(3);
  let dependentService = require('../imports/lib/dependent-service');
  let serviceAisOn = true;
  let starterWasCalled = false;
  let serviceA = dependentService({
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

test('dependent-service: startChecking and stopChecking', (t) => {
  t.plan(2);
  let dependentService = require('../imports/lib/dependent-service');
  let checkCounter = 0;
  let serviceA = dependentService({
    checker: (cb) => {
      checkCounter++;
      cb(null, true);
    },
    starter: (onStarted) => {
      onStarted();
    },
    interval: 20
  });
  serviceA.stopChecking();
  let counterStoppedAt = checkCounter;
  setTimeout(() => {
    t.equal(counterStoppedAt, checkCounter, 'Counter stopped');
    serviceA.startChecking();
    setTimeout(() => {
      t.ok(checkCounter > counterStoppedAt, 'Counter increased')
      serviceA.stopChecking();
      t.end();
    }, 80)
  }, 80)
})

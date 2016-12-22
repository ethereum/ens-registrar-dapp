var test = require('tape');

test('dependent-service: call starter', (t) => {
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
  serviceA.startChecking();
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

test('dependent-service: start, stop, and listen', (t) => {
  t.plan(5);
  let dependentService = require('../imports/lib/dependent-service');
  let checkCounter = 0;
  let listenCounter = 0;
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
  serviceA.listenStatus(() => listenCounter++)
  serviceA.startChecking();
  setTimeout(() => {
    serviceA.stopChecking();
    let counterStoppedAt = checkCounter;
    let listenCounterStoppedAt = listenCounter;
    t.equal(checkCounter, listenCounter, 'Listeners are reported on every check')

    setTimeout(() => {
      t.equal(counterStoppedAt, checkCounter, 'Check counter stopped');
      t.equal(listenCounterStoppedAt, listenCounter, 'Listen counter stopped');
      serviceA.startChecking();
      setTimeout(() => {
        t.ok(checkCounter > counterStoppedAt, 'Check counter increased')
        t.ok(listenCounter > listenCounterStoppedAt, 'Listen counter increased')
        serviceA.stopChecking();
        t.end();
      }, 80)
    }, 80)
  }, 80);

})

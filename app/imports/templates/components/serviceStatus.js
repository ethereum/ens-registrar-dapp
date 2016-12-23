Template['components_serviceStatus'].helpers({
  class() {
    return Template.instance().data.status.ok ? 'service-ok' : 'service-not-ok';
  }
})

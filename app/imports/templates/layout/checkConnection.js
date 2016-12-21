import ethereum from '/imports/lib/ethereum';

Template['layout_checkConnection'].onCreated(function() {
  TemplateVar.set(this, 'connectionStatus', 'Connecting to Ethereum...');
  ethereum.onStatusChange((status) => {
    TemplateVar.set(this, 'connectionOk', status.isReady);
    TemplateVar.set(this, 'connectionStatus', status.description);
  })
});

Template['layout_checkConnection'].helpers({
  connectionOk() {
    return TemplateVar.get('connectionOk');
  },
  connectionStatus() {
    return TemplateVar.get('connectionStatus');
  }
})

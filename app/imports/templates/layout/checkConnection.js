import ethereum from '/imports/lib/ethereum';

Template['layout_checkConnection'].onCreated(function() {
  ethereum.onStatusChange(status => {
    TemplateVar.set(this, 'isReady', status.isReady)
    TemplateVar.set(this, 'description', status.description)
  })
  ethereum.init();
});


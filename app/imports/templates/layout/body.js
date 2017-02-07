import ethereum, { errors } from '/imports/lib/ethereum';

Template['layout_body'].onCreated(function(){
  ethereum.onStatusChange(status => {
    TemplateVar.set(this, 'networkError', false)
    TemplateVar.set(this, 'isReady', status.isReady)
    TemplateVar.set(this, 'description', status.description)
    if (status.theresAnError) {
      TemplateVar.set(this, 'theresAnError', status.theresAnError)
      if (status.description === errors.invalidNetwork) {
        TemplateVar.set(this, 'networkError', true)
      }
    }
    
  })
  ethereum.init();
});

Template['layout_body'].events({
  'click .retry': function() {
    ethereum.init();
  }
})


// CUSTOM ENS CONTRACT TEMPLATE
Template['useCustomContract'].events({
  'click .use-custom-contract .dapp-block-button': function() {
    const address = TemplateVar.getFrom('.ens-address', 'value');
    ethereum.setCustomContract(address)
    ethereum.init()
  }
})
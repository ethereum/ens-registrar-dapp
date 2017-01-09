import ethereum, { errors } from '/imports/lib/ethereum';

/**
Template Controllers

@module Templates
*/

/**
The home template

@class [template] layout_body
@constructor
*/

Template['layout_body'].helpers({
    /**
    Get the name

    @method (name)
    */

    'name': function() {
        return this.name || TAPi18n.__('dapp.home.defaultName');
    },
    'network': function() {
      return Session.get('network');
    }
});

// When the template is created
Template['layout_body'].onCreated(function(){
  Meta.setSuffix(TAPi18n.__("dapp.home.title"));
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
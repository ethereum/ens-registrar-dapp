import ethereum from '/imports/lib/ethereum';

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
    TemplateVar.set(this, 'isReady', status.isReady)
    TemplateVar.set(this, 'description', status.description)
  })
  ethereum.init();
});

/**
Template Controllers

@module Templates
*/

/**
The home template

@class [template] views_home
@constructor
*/

Template['views_home'].helpers({
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
Template['views_home'].onCreated(function(){
	Meta.setSuffix(TAPi18n.__("dapp.home.title"));
});

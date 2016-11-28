/**
Template Controllers

@module Templates
*/

/**
The view1 template

@class [template] views_view1
@constructor
*/

Template['views_home'].helpers({
    /**
    Get the name

    @method (name)
    */

    'name': function(){
        return this.name || TAPi18n.__('dapp.home.defaultName');
    }
});

// When the template is created
Template['views_home'].onCreated(function(){
	Meta.setSuffix(TAPi18n.__("dapp.home.title"));
});

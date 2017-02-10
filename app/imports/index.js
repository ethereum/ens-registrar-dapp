if(location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  Meteor.disconnect();
}

Meteor.startup(function() {
    // SET default language
    if(Cookie.get('TAPi18next')) {
        TAPi18n.setLanguage(Cookie.get('TAPi18next'));
    } else {
        var userLang = navigator.language || navigator.userLanguage,
        availLang = TAPi18n.getLanguages();

        // set default language
        if (_.isObject(availLang) && availLang[userLang]) {
            TAPi18n.setLanguage(userLang);
            // lang = userLang;
        } else if (_.isObject(availLang) && availLang[userLang.substr(0,2)]) {
            TAPi18n.setLanguage(userLang.substr(0,2));
            // lang = userLang.substr(0,2);
        } else {
            TAPi18n.setLanguage('en');
            // lang = 'en';
        }
    }

    // Setup Moment and Numeral i18n support
    Tracker.autorun(function(){
        if(_.isString(TAPi18n.getLanguage())) {
            moment.locale(TAPi18n.getLanguage().substr(0,2));
            numeral.language(TAPi18n.getLanguage().substr(0,2));
        }
    });

    // make reactive
    Tracker.autorun(updateMistMenu);
});


updateMistMenu = function() {
    var names = Names.find({mode: {$in: ['auction', 'reveal']}}, {sort: {registrationDate: 1}}).fetch();
    mist.menu.clear();

    _.each(names, function(e,i){
        var m =  moment(e.registrationDate * 1000 - 24 *60*60*1000);
        var timeRemaining = m.fromNow(true);


        console.log('updateMistMenu: ', e.fullname, e.registrationDate, timeRemaining, i);


        mist.menu.add(e._id, {
            name: e.fullname,
            badge: timeRemaining,
            position: i
        }, function(){
            Session.set('searched', e.name);

            // Redirect
            // window.location = 'http://domain.com/send';
            // // Using history pushstate
            // history.pushState(null, null, '/my-entry');
            // // In Meteor iron:router
            // Router.go('/send');
        })
    })
    
}
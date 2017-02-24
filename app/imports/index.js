import { registrar } from '/imports/lib/ethereum';

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

    // add class to the header when scrolling
    $(window).on('scroll', function() {
        var scrollPosition = $(window).scrollTop();
        
        if( scrollPosition > 150 ) {
            $('header').addClass('fixed');
        } else if( scrollPosition > 90 ) {
            $('header').addClass('about-to-be-fixed ');
        } else {
            $('header').removeClass('fixed');
            $('header').removeClass('about-to-be-fixed ');
        }
    })

    // add an interval to check on auctions every so ofter
    setInterval(updateRevealNames, 60000);

});

updateRevealNames = function() {
    var cutoutDate = Math.floor(Date.now()/1000) + 48*60*60;
    var names = Names.find({$or:[{registrationDate: {$gt: Math.floor(Date.now()/1000), $lt: cutoutDate}, watched: true},{mode: {$in: ['auction', 'reveal']}, registrationDate: {$lt: Math.floor(Date.now()/1000)}}]}).fetch();

    console.log('update Reveal Names: ', _.pluck(names, 'name').join(', '));

    _.each(names, function(e, i) {
        registrar.getEntry(e.name, (err, entry) => {
        if(!err && entry) {
            Names.upsert({name: e.name}, {$set: {
                mode: entry.mode, 
                value: entry.mode == 'owned' ? Number(web3.fromWei(entry.deed.balance.toFixed(), 'ether')) : 0, 
                highestBid: entry.highestBid
              }});            
        }})        
    })
}

updateMistMenu = function() {

    if (typeof mist !== 'undefined' && mist && mist.menu) {
        var names = Names.find({mode: {$in: ['auction', 'reveal']}, watched: true}, {sort: {registrationDate: 1}}).fetch();
        mist.menu.clear();
        mist.menu.setBadge('');

        _.each(names, function(e,i){
            if (e.mode == 'auction') {
                var m =  moment(e.registrationDate * 1000 - 48*60*60*1000);
                var badge = m.fromNow(true);
            } else {
                if ( MyBids.find({name: e.name, revealed: { $not: true }}).count() > 0) {
                    var badge = '🚨';
                    mist.menu.setBadge('🚨 Bids expire soon');
                }
            }


            mist.menu.add(e._id, {
                name: e.fullname,
                badge: badge,
                position: i
            }, function(){
                Session.set('searched', e.name);
            })
        })
    }
    
}




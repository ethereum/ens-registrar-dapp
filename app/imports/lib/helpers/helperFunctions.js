/**
Helper functions

@module Helpers
**/

/**
The Helpers class containing helper functions

@class Helpers
@constructor
**/

Helpers = {};


/**
Reruns functions reactively, based on an interval. Use it like so:

    Helpers.rerun['10s'].tick();

@method (rerun)
**/

Helpers.rerun = {
    '10s': new ReactiveTimer(10)
};


/**
Clear localStorage

@method (getLocalStorageSize)
**/

Helpers.getLocalStorageSize = function(){

    var size = 0;
    if(localStorage) {
        _.each(Object.keys(localStorage), function(key){
            size += localStorage[key].length * 2 / 1024 / 1024;
        });
    }

    return size;
};



/**
Reactive wrapper for the moment package.

@method (moment)
@param {String} time    a date object passed to moment function.
@return {Object} the moment js package
**/

Helpers.moment = function(time){

    // react to language changes as well
    TAPi18n.getLanguage();

    if(_.isFinite(time) && moment.unix(time).isValid())
        return moment.unix(time);
    else
        return moment(time);

};


/**
Formats a timestamp to any format given.

    Helpers.formatTime(myTime, "YYYY-MM-DD")

@method (formatTime)
@param {String} time         The timstamp, can be string or unix format
@param {String} format       the format string, can also be "iso", to format to ISO string, or "fromnow"
@return {String} The formated time
**/

Helpers.formatTime = function(time, format) { //parameters
    
    // make sure not existing values are not Spacebars.kw
    if(format instanceof Spacebars.kw)
        format = null;

    if(time) {

        if(_.isString(format) && !_.isEmpty(format)) {

            if(format.toLowerCase() === 'iso')
                time = Helpers.moment(time).toISOString();
            else if(format.toLowerCase() === 'fromnow') {
                // make reactive updating
                Helpers.rerun['10s'].tick();
                time = Helpers.moment(time).fromNow();
            } else
                time = Helpers.moment(time).format(format);
        }

        return time;

    } else
        return '';
};

/**
Refreshes the status of the currently searched name
**/
Helpers.refreshStatus = function refreshStatus() {
  const name = Session.get('searched');
  window.location.hash = '';
  Session.set('searched', '');
  Session.set('name', '');
  setTimeout(function() {
    Session.set('searched', name);
    window.location.hash = name;
  }, 0);
}

/**
Waits for a tx to get mined into a block and
returns if the tx was successful or not.
**/
Helpers.checkTxSuccess = function checkTxSuccess(txid, callback) {
  function whenMined(txid, cb) {
    function check() {
      web3.eth.getTransaction(txid, (err, tx) => {
        if (err) {
          return cb(err)
        }
        if (tx && tx.blockNumber) {
          cb(null, tx)
        } else {
          setTimeout(check, 500)
        }
      })
    }
    check();
  }
  
  whenMined(txid, (err, tx) => {
    if (err) {
      return callback(err)
    }
    web3.eth.getTransactionReceipt(txid, (err, receipt) => {
      if (receipt.gasUsed < tx.gas) {
        callback(null, receipt)
      } else {
        callback(null, false)
      }
    })
  })
}

Helpers.getTxHandler = function({onDone, onSuccess, onError}) {
  function reportError(err) {
    if (onError) {
      onError(err);
    } else {
      GlobalNotification.error({
          content: err.toString(),
          duration: 3
      });
    }
    onDone();
  }
  
  return function(err, txid) {
    if (err) {
      return reportError(err);
    } 
    console.log('Tx: ' +txid);
    Helpers.checkTxSuccess(txid, (err, receipt) => {
      if (err) {
        return reportError(err);
      }
      if (receipt) {
        onSuccess(txid, receipt);
        onDone();
      } else {
        reportError('The transaction failed')
      }
      
    })
  };
}

export default Helpers;

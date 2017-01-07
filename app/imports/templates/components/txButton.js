function whenMined(txid, cb) {
  function check() {
    web3.eth.getTransaction(txid, (err, tx) => {
      if (err) {
        return cb(err)
      }
      if (tx.blockNumber) {
        cb(null, tx)
      } else {
        setTimeout(check, 500)
      }
    })
  }
  check();
}

/**
A button that waits for a transaction to get
mined into a block.

Deals with tx errors.
*/
Template['components_txButton'].events({
  'click .dapp-block-button': function() {
    let template = Template.instance();
    let { makeTx, onSuccess } = template.data;
    TemplateVar.set('status', 'submitting');
    
    function reportError(err) {
      TemplateVar.set(template, 'status', 'error')
      TemplateVar.set(template, 'error message', err)
    }
    makeTx((err, txid) => {
      if (err) {
        reportError(err)
        return;
      }
      TemplateVar.set(template, 'status', 'confirming');
      whenMined(txid, (err, tx) => {
        if (err) {
          return reportError(err)
        }
        web3.eth.getTransactionReceipt(txid, (err, receipt) => {
          if (receipt.gasUsed < tx.gas) {
            TemplateVar.set(template, 'status', 'success');
            if (onSuccess) {
              onSuccess()
            }
          } else {
            reportError('Transaction failed')
          }
        })
      })
    })
  }
})

Template['components_txButton'].helpers({
  isConfirming() {
    return TemplateVar.get('status') == 'confirming'
  },
  theresAnError() {
    return TemplateVar.get('status') == 'error'
  },
  isSuccessful() {
    return TemplateVar.get('status') == 'success'
  },
  error() {
    return TemplateVar.get('error message')
  },
  isBusy() {
    return TemplateVar.get('status') == 'confirming' || 
      TemplateVar.get('status') == 'submitting';
  }
})
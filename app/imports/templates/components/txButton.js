/**
A button that waits for a confirmation on 
a transaction.

Deals with out of gas errors and tx errors.
*/
Template['components_txButton'].events({
  'click .dapp-block-button': function() {
    let template = Template.instance();
    let makeTx = template.data.makeTx;
    TemplateVar.set('status', 'submitting');
    makeTx((err, txid) => {
      if (err) {
        TemplateVar.set(template, 'status', 'error')
        TemplateVar.set(template, 'error message', err)
        return;
      }
      TemplateVar.set(template, 'status', 'confirming');
      //todo: actually wait for a confirmation
      setTimeout(() => {
        TemplateVar.set(template, 'status', 'success');
      }, 1000)
    })
  }
})

Template['components_txButton'].helpers({
  isSubmitting() {
    return TemplateVar.get('status') == 'submitting'
  },
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
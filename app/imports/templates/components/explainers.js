
Template['component_explainerBody'].events({
  'click .explainer': function(e) {
      EthElements.Modal.show('modals_explainer', {
        class: 'explainer-modal'
      });
  }
});

import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

function updateRevealedStatus(template, bid) {
  registrar.isBidRevealed(bid, (err, isRevealed) => {
    if(err) {
      console.error('Error getting revealed status for bid');
      return;
    }
    TemplateVar.set(template, 'isRevealed', isRevealed);
    MyBids.update({ _id: bid._id }, { $set: {revealed: isRevealed} });
  })
}

Template['components_bid'].onCreated(function() {
  let template = Template.instance();
  let bid = template.data.bid;
  updateRevealedStatus(template, bid);
  TemplateVar.set(template, 'revealing', false)
})

Template['components_bid'].events({
  'click .reveal-bid': function(e, template) {
    let bid = template.data.bid.bid ? template.data.bid.bid : template.data.bid;
    TemplateVar.set(template, 'revealing', true);
    // Names.update({fullname: })
    // Any account can reveal
    let mainAccount = web3.eth.accounts[0];

    registrar.unsealBid(bid, {
      from: mainAccount, 
      gas: 300000
    }, Helpers.getTxHandler({
      onDone: () => TemplateVar.set(template, 'revealing', false),
      onSuccess: () => updateRevealedStatus(template, bid)
    })); 
  }
})

Template['components_bid'].helpers({
  isRevealed() {
    return TemplateVar.get('isRevealed');
  },
  revealing() {
    return TemplateVar.get('revealing');
  },
  canReveal() {
    return this.status == 'reveal';
  }
})

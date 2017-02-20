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
})

Template['components_bid'].events({
  'click .reveal-bid': function(e, template) {
    if (web3.eth.accounts.length == 0) {
      GlobalNotification.error({
          content: 'No accounts added to dapp',
          duration: 3
      });
      return;
    }
    let bid = template.data.bid.bid ? template.data.bid.bid : template.data.bid;
    TemplateVar.set(template, `revealing-${bid.name}`, true);
    // Names.update({fullname: })
    registrar.unsealBid(bid, {
      from: web3.eth.accounts[0], // Any account can reveal
      gas: 300000
    }, Helpers.getTxHandler({
      onDone: () => TemplateVar.set(template, `revealing-${bid.name}`, false),
      onSuccess: () => updateRevealedStatus(template, bid)
    })); 
  }
})

Template['components_bid'].helpers({
  isRevealed() {
    return TemplateVar.get('isRevealed');
  },
  revealing() {
    return TemplateVar.get(`revealing-${this.bid.name}`);
  },
  canReveal() {
    return this.status == 'reveal';
  }
})

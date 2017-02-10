import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

function updateRevealedStatus(template, bid) {
  registrar.isBidRevealed(bid, (err, isRevealed) => {
    if(err) {
      console.error('Error getting revealed status for bid');
      return;
    }
    TemplateVar.set(template, 'isRevealed', isRevealed);
  })
}

Template['components_bid'].onCreated(function() {
  let template = Template.instance();
  let bid = template.data.bid;
  updateRevealedStatus(template, bid);
})

Template['components_bid'].events({
  'click .reveal-bid': function() {
    let template = Template.instance();
    let bid = template.data.bid.bid ? template.data.bid.bid : template.data.bid;
    MyBids.update({ _id: bid._id }, { $set: {revealing: true} });
    
    // Names.update({fullname: })
    // Any account can reveal
    let mainAccount = EthAccounts.find().fetch()[0].address;

    registrar.unsealBid(bid, {
      from: mainAccount, 
      gas: 300000
    }, Helpers.getTxHandler({
      onDone: () => MyBids.update({ _id: bid._id }, { $set: {revealing: false} }),
      onSuccess: () => updateRevealedStatus(template, bid)
    })); 
  }
})

Template['components_bid'].helpers({
  isRevealed() {
    return TemplateVar.get('isRevealed');
  },
  revealing() {
    return MyBids.findOne({_id: this.bid._id}).revealing;
  },
  canReveal() {
    return template.data.status == 'reveal';
  }
})
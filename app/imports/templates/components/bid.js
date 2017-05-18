import { registrar } from '/imports/lib/ethereum';
import ethereum from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

function updateRevealedStatus(template, bid) {
  registrar.isBidRevealed(bid, (err, isRevealed) => {
    console.log('isBidRevealed callback', isRevealed, err)
    if(err) {
      console.error('Error getting revealed status for bid');
      return;
    }
    TemplateVar.set(template, 'isRevealed', isRevealed);
    MyBids.update({ _id: bid._id }, { $set: {revealed: isRevealed} });
    
    // If you can, update the menu
    if (ethereum && ethereum.updateMistMenu)
      ethereum.updateMistMenu();
  });

  setTimeout(function() {
    // Timeout, set revealing as false
    console.log('Timeout, set revealing as false')
    MyBids.update({ _id: bid._id }, { $set: {revealing: false} });
  }, 60000);
}

Template['components_bid'].onRendered(function() {
  let template = Template.instance();
  let bid = template.data.bid;
  updateRevealedStatus(template, bid);
})

Template['components_bid'].events({
  'click .reveal-bid': function(e, template) {
    
    let bid = template.data.bid.bid ? template.data.bid.bid : template.data.bid;
    TemplateVar.set(template, `revealing-${bid.name}`, true);
    // Names.update({fullname: })
    registrar.unsealBid(bid, {
      from: bid.owner, // Any account can reveal
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
  recoverAfterBurn() {
    return web3.fromWei(MyBids.findOne({_id: this.bid._id}).depositAmount, 'ether') / 200;
  },
  refund() {
    var bid = MyBids.findOne({_id: this.bid._id});
    return Number(bid.depositAmount) - Number(bid.value);
  },
  canReveal() {
    return this.status === 'reveal';
  },
  expired() {
    return this.status === 'owned';
  }, 
  isTopBidder() {
    var value = Number(web3.fromWei(MyBids.findOne({_id: this.bid._id}).value, 'ether'));    
    var highestBid = Number(web3.fromWei(Names.findOne({name: this.bid.name}).highestBid, 'ether'));
    return value >= highestBid;
  }, 
  burnFee() {
    return MyBids.findOne({_id: this.bid._id}).value / 200;
  }
})

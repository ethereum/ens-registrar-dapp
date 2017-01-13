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
    let bid = template.data.bid;
    MyBids.update({ _id: bid._id }, { $set: {revealing: true} })
    registrar.unsealBid(bid, {
      from: bid.owner,//todo: check if account is bid owner
      gas: 300000
    }, (err, txid) => {
      if(err) {
        alert(err)
        MyBids.update({ _id: bid._id }, { $set: {revealing: false} })
        return
      }
      console.log(txid)
      Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
        if (err) {
          alert(err)
          MyBids.update({ _id: bid._id }, { $set: {revealing: false} })
          return;
        }
        if(isSuccessful) {
          updateRevealedStatus(template, bid)
        } else {
          alert('Revealing the bid failed')
        }
        MyBids.update({ _id: bid._id }, { $set: {revealing: false} })
      })      
    })
  }
})

Template['components_bid'].helpers({
  isRevealed() {
    return TemplateVar.get('isRevealed');
  },
  revealing() {
    return MyBids.findOne({_id: this.bid._id}).revealing;
  }
})
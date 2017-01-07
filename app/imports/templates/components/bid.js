import { registrar } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

Template['components_bid'].events({
  'click .reveal-bid': function() {
    let template = Template.instance();
    let bid = template.data.bid;
    TemplateVar.set('revealing', true)
    registrar.unsealBid(bid.name, bid.owner, bid.bidAmount, bid.masterPassword, {
      from: bid.owner,
      gas: 100000
    }, (err, txid) => {
      if(err) {
        alert(err)
        return
      }
      console.log(txid)
      Helpers.checkTxSuccess(txid, (err, isSuccessful) => {
        if(isSuccessful) {
          TemplateVar.set(template, 'revealed', true)
          //todo: get revealed status from the contract
        } else {
          alert('Revealing the bid failed')
        }
        TemplateVar.set(template, 'revealing', false)
      })      
    })
  }
})
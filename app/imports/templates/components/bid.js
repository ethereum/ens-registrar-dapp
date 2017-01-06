import { registrar } from '/imports/lib/ethereum';

Template['components_bid'].events({
  'click .reveal-bid': function() {
    let template = Template.instance();
    let bid = template.data.bid;
    TemplateVar.set('revealing', true)
    registrar.unsealBid(bid.name, bid.owner, bid.bidAmount, bid.masterPassword, {
      from: bid.owner,
      gas: 200000
    }, (err, res) => {
      if(err) {
        alert(err)
      } else {
        console.log(res)
        //todo: it's not success yet; the tx must have no errors
        TemplateVar.set(template, 'revealed', true)
        //todo: get revealed status from the contract
      }
      TemplateVar.set(template, 'revealing', false)
    })
  }
})
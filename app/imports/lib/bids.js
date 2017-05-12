import { registrar } from './ethereum';

export function updatePendingBids(name) {
  let bids = PendingBids.find({name}).fetch();

  bids.forEach(bid => {
    registrar.contract.sealedBids.call(bid.owner, bid.shaBid, (err, result) => {
      if (!err && result !== '0x0000000000000000000000000000000000000000') {
        // check for duplicates 
        var dupBid = MyBids.find({secret:bid.secret}).fetch();
        if (dupBid && dupBid.name == bid.name && dupBid.secret == bid.secret && dupBid.hash == bid.hash) {
          console.log('Tried to insert duplicate bid!', dupBid);
          return;
        }

        //bid successfully submitted
        MyBids.insert(bid);
        PendingBids.remove({id: bid._id});
      }
    });
  })
}

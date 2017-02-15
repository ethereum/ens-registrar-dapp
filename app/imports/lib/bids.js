import { registrar } from './ethereum';

export function updatePendingBids(name) {
  let bids = PendingBids.find({name}).fetch();
  bids.forEach(bid => {
    registrar.contract.sealedBids.call(bid.shaBid, (err, result) => {
      if (!err && result !== '0x0000000000000000000000000000000000000000') {
        //bid successfully submitted
        MyBids.insert(bid);
        PendingBids.remove({id: bid._id});
      }
    });
  })
}

Template['view_bids'].helpers({
  bids() {
    return MyBids.find();
  }
})
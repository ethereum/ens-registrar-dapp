
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server
var networkId = web3.eth.getBlock(0).hash.slice(2,8);

MyBids = new Mongo.Collection('ens-dapp-db-'+networkId, {connection: null});
new PersistentMinimongo(MyBids);

PendingBids = new Mongo.Collection('ens-dapp-db-pending-bids-'+networkId, {connection: null});
new PersistentMinimongo(PendingBids);

Names = new Mongo.Collection('ens-dapp-db-names-'+networkId, {connection: null});
new PersistentMinimongo(Names);

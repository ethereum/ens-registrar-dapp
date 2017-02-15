
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

// A test persitent collection
MyBids = new Mongo.Collection('ens-dapp-db', {connection: null});
new PersistentMinimongo(MyBids);

Names = new Mongo.Collection('ens-dapp-db-names', {connection: null});
new PersistentMinimongo(Names);

PublicAuctions = new Mongo.Collection('ens-dapp-db-public-auctions', {connection: null});
new PersistentMinimongo(PublicAuctions);
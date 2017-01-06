
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

// A test persitent collection
MyBids = new Mongo.Collection('ens-dapp-db', {connection: null});
new PersistentMinimongo(MyBids);
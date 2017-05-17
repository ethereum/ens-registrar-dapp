
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

export default function initCollections(networkId) {
  MyBids = new Mongo.Collection('ens-dapp-db-'+networkId, {connection: null});
  new PersistentMinimongo(MyBids);

  PendingBids = new Mongo.Collection('ens-dapp-db-pending-bids-'+networkId, {connection: null});
  new PersistentMinimongo(PendingBids);

  // Names = new Mongo.Collection('ens-dapp-db-names-'+networkId, {connection: null});
  // new PersistentMinimongo(Names);

  NamesV1 = new Mongo.Collection('ens-dapp-db-names-'+networkId, {connection: null});
  new PersistentMinimongo(NamesV1);

  Names = new Mongo.Collection('ens-dapp-db-namesV2-'+networkId, {connection: null});
  new PersistentMinimongo(Names);

  // Migrating data from old schema
  oldNamesCount = NamesV1.find().count();
  if (oldNamesCount > 0) {
    NamesV1.find().fetch().forEach((n) => {
      var name = n;
      delete name._id;
      // TODO: do not save hash on record.
      Names.upsert(name.hash, name);
    });
    // TODO: Enable when on production
    // NamesV1.remove();
  }
}

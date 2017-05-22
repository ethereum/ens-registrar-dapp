
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

function migrateFromV1ToV2(oldCollection, newCollection){
  oldNamesCount = oldCollection.find().count();
  if (oldNamesCount > 0) {
    oldCollection.find().fetch().forEach((n) => {
      var name = n;
      var _id = name.hash;

      // Removing unnecessary data
      delete name._id;
      delete name.hash;
      delete name.fullname;

      newCollection.upsert(_id, name);
      console.log('Migrated ' + name.hash + ' - ' + name.name, name);
    });

    // TODO: Enable when on production
    // oldCollection.remove();
  }
}

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
  // from `ens-dapp-db-names` to `ens-dapp-db-namesV2`
  migrateFromV1ToV2(NamesV1, Names);
}

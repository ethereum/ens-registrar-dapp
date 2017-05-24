
// Names Collection V2 uses name hash as key.
function migrateFromV1ToV2(oldCollection, newCollection){
  oldNamesCount = oldCollection.find().count();
  if (oldNamesCount > 0) {
    console.log('Migrating data...');
    // clearing block pointer, as we deleted all old unwatched names.
    localStorage.removeItem('lastBlockLooked');
    console.log('Removing lastBlockLooked');
    oldCollection.find({watched: true}).fetch().forEach((n) => {
      console.log('Migrating ' + name.name, name);
      var name = n;
      var _id = name.hash;

      // Removing unnecessary data
      delete name._id;
      delete name.hash;
      delete name.fullname;

      newCollection.upsert(_id, name);
    });
    console.log('Removing old Names collection...');
    oldCollection.remove({});
  }
}

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
  // from `ens-dapp-db-names` to `ens-dapp-db-namesV2`
  migrateFromV1ToV2(NamesV1, Names);
}

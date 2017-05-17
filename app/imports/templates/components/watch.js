
Template['components_watch'].events({
  'click .watch': function() {
      var fullname = Template.instance().data.name;
      var name = fullname.replace('.eth', '');
      console.log('watchjs - watch - fullname', fullname);
      Names.upsert({name: name}, { $set: {watched: true}});
  },
  'click .unwatch': function() {
      var fullname = Template.instance().data.name;
      var name = fullname.replace('.eth', '');
      console.log('watchjs - unwatch - fullname', fullname);
      Names.upsert({name: name}, { $set: {name: fullname.replace('.eth',''), watched: false}});
  }
})

Template['components_watch'].helpers({
  isWatched() {
    var name = Template.instance().data.name;
    var n = Names.findOne({name: name.replace('.eth', '')})
    return n && n.watched;
  }
})
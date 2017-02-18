
Template['components_watch'].events({
  'click .watch': function() {
      var fullname = Template.instance().data.name;
      var n = Names.findOne({fullname: fullname});
      Names.upsert({fullname: fullname}, { $set: {name: fullname.replace('.eth',''), watched: true}});
  },
  'click .unwatch': function() {
      var fullname = Template.instance().data.name;
      Names.upsert({fullname: fullname}, { $set: {name: fullname.replace('.eth',''), watched: false}});
  }
})

Template['components_watch'].helpers({
  isWatched() {
    var fullname = Template.instance().data.name;
    var n = Names.findOne({fullname: fullname})
    return n && n.watched;
  }
})
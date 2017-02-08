
Template['components_watch'].events({
  'click .watch': function() {
      var name = Template.instance().data.name;
      Names.insert( {name: name.replace('.eth',''), fullname: name});
  },
  'click .unwatch': function() {
      var name = Template.instance().data.name;
      Names.remove( {fullname: name});
  }
})

Template['components_watch'].helpers({
  isWatched() {
    var name = Template.instance().data.name;
    return Names.findOne({fullname: name}) === undefined 
  }
})
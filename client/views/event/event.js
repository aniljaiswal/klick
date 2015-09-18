Template['event'].helpers({
  viewable: function () {
    return moment().add(this.config.release_frame, 'days').isAfter(this.eventData.date);
  },
  getCountdown: function() {
    return Session.get("time");
  },
  future: function(){
    return this.eventData.date > new Date();
  },
  isRegistered: function(){
    if(this.eventData.users && _.indexOf(this.eventData.users, Meteor.userId()) != -1){
      return true;
    } else {
      return false;
    }
  },
  groupAttr: function (context) {
    var classes = "col-centered ";
    if(context.eventData.groupLimit > 8){
      return {class: classes + "col-md-2"};
    } else {
      return {class: classes + "col-md-3"};
    }
  },
  group: function(){
    var group = [];
    var groups = Events.findOne({_id: this.eventData._id}).groups;
    if (groups) {
      for (var i = groups.length - 1;i >= 0; i--) {
        var usersIndex = groups[i].indexOf(Meteor.userId());
        if(usersIndex !== -1){
          group = groups[i];
          group.splice(usersIndex,1);
          break;
        }
      };
    }
    return Meteor.users.find({_id: {$in: group}});
  },
  groupEmails: function(){
    var group = [];
    var groups = Events.findOne({_id: this.eventData._id}).groups;
    if (groups) {
      for (var i = groups.length - 1;i >= 0; i--) {
        var usersIndex = groups[i].indexOf(Meteor.userId());
        if(usersIndex !== -1){
          group = groups[i];
          group.splice(usersIndex,1);
          break;
        }
      };
    }
    return Meteor.users.find({_id: {$in: group}}).fetch().map(function(user){
      return user.emails[0].address;
    })
  }
  
});

Template['event'].events({
  "click #register": function (event, template) {
    Events.update(this.eventData._id,{
      $addToSet: {users: Meteor.userId()},
    })
  },
  "click #unregister": function (event, template) {
    Events.update(this.eventData._id,{
      $pull: {users: Meteor.userId()},
    })
  },
});

Template['event'].onRendered(function(){
  var now = moment();
  var releaseDate = moment(this.data.eventData.date).subtract(this.data.config.release_frame, 'days');
  var diff = releaseDate.diff(now, 'seconds');
  var clock = diff;

  var timeLeft = function() {
    if (clock > 0) {
      clock--;
      Session.set("time", clock);
    } else {
      return Meteor.clearInterval(interval);
    }
  };

  var interval = Meteor.setInterval(timeLeft, 1000);
})

var sortTables = [];
var new_groups = [];

Template['arrangeGroups'].helpers({
  userGroups: function() {
      var users = Meteor.users.find({_id: {$in: this.users}}).fetch();
      var userSets = [];
      _.each(this.groups,function(group, iG, groups){
        var table = {id: iG+1, people:[]};
        _.each(group,function(userId, iU, group){
          var user = _.where(users, {_id: userId})[0];
          table.people.push(user);
        });
        userSets.push(table)
      });
      return userSets;
  },

  randomnessScore: function(tableID){
    var num = Session.get(tableID.toString());
    return Math.ceil(num)
  },
});

Template['arrangeGroups'].events({
  'click #auto-group': function(event, template){
    Events.update(this._id, {$set: {manualSort: false}});
    toggleGroupMode();
    Session.set('new_groups',this.groups);
    Router.go('event', this);
  },
  'click #manual-group': function(event, template){
    Events.update(this._id, {$set: {manualSort: true}});
    Session.set('new_groups',this.groups);
    toggleGroupMode();
  },
  'click #save-group': function(event, template){
    var new_groups = Session.get('new_groups');
    if(_.every(new_groups, function(group){return group.length <= this.groupLimit+1}, this)){
      Events.update(this._id, {$set: {groups: new_groups}});
      console.log(new_groups)
    } else {
      alert('Groups must be smaller than '+ this.groupLimit)
    }
  },
  'click #shuffle-group': function(event, template){
    var new_groups = Groups.shuffleIntoGroups(this.users, this.groupLimit, this.hosts)
    Events.update(this._id, {$set: {groups: new_groups}});
    Session.set('new_groups',new_groups);
    Router.go('eventEdit', this);
  }
});

Template['arrangeGroups'].onRendered(function(){
  _.each(this.data.groups,function(group, index){
    var rScore = Groups.getGroupDistanceFromIDs(group);
    Session.set((index+1).toString(), rScore);
  })

  var manualSort = !!this.data.manualSort;
  Session.set('new_groups',this.data.groups);
  var tables = document.getElementsByClassName('sortable-table');
  Array.prototype.forEach.call(tables, function (table){
    var sortTable = Sortable.create(table,{
      group: {name: 'tables', put:true, pull:true},
      sort: false,
      disabled: !manualSort,
      handle: '.people',
      onAdd: function (event) { 
        var new_groups = Session.get('new_groups');
        var userId = event.item.dataset.userId;
        var fromTable = event.from.dataset.tableId;
        var toTable = event.to.dataset.tableId;
        var i = new_groups[fromTable-1].indexOf(userId)
        new_groups[fromTable-1].splice(i,1);
        new_groups[toTable-1].push(userId);
        console.log("Moving user: " + userId + " from " + fromTable+ " to " + toTable);
        Session.set('new_groups', new_groups);
        console.log(new_groups)

        Session.set((fromTable).toString(), Groups.getGroupDistanceFromIDs(new_groups[fromTable-1]));
        Session.set((toTable).toString(), Groups.getGroupDistanceFromIDs(new_groups[toTable-1]));
      },
    });
    sortTables.push(sortTable);
  })
});

function toggleGroupMode(s){
  _.each(sortTables,function(sortTable){
    var state = s || sortTable.option("disabled"); 
    sortTable.option("disabled", !state);
  });
}
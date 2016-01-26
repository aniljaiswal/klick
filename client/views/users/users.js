Template['users'].helpers({
  isRole: function(user, role){
    if(Roles.userIsInRole(user,[role])){
      return true;
    } else {
      return false;
    }
  },

  settings: function () {
      return {
          collection: Meteor.users,
          rowsPerPage: 10,
          showFilter: false,
          fields: [
            {key:'name', label:'Name', tmpl: Template.users_name},
            {key:'username', label:'Email'},
            {key:'canceledEvents', label:'# Canceled Klicks', fn: function(value, object){return object.canceledEvents ? object.canceledEvents.length : 0;}},
            {key:'klicks', label:'# of klicks', fn: function(value, object){return object.klicks ? object.klicks.length : 0;}},
            {key:'settings', label:'Settings', tmpl: Template.user_settings},
          ]
      };
  }
});

Template['users'].events({
  "click #set-admin": function(event, template){
    Roles.addUsersToRoles(this, ['admin'])
  },
  "click #remove-admin": function(event, template){
    var index = this.roles.indexOf(5);
    this.roles.splice(index, 1);
    Roles.setUserRoles(this, this.roles);
  },
  "click #delete-user": function(event, template){
    Meteor.users.remove({_id:this._id}) ;
  },
  "click #download-csv": function(event) {
      var nameFile = 'users.csv';
      Meteor.call('download_users', function(err, fileContent) {
        if(fileContent){
          var blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
          saveAs(blob, nameFile);
        }
      });
  }

});

Template['user_settings'].helpers({
  isRole: function(user, role){
    if(Roles.userIsInRole(user,[role])){
      return true;
    } else {
      return false;
    }
  }
});
function loadUser(user) {
  var userAlreadyExists = typeof Meteor.users.findOne({ emails: { $elemMatch: { address: user.email } } }) === 'object';
  if (!userAlreadyExists) {
    console.log('=======================================\n\n');
    console.log(user);
    var id;

    id = Accounts.createUser(user);

    if (user.roles.length > 0) {
      Roles.addUsersToRoles(id, user.roles);
    }
    console.log(Meteor.users.findOne({_id: id}));
    Events.find().forEach(function(eventOb){
      console.log('Adding user to event: ' + eventOb.title);
      Events.update(eventOb._id,{
        $addToSet: {users: id},
      })
    })
  }
}

function loadSettings(settings){
  var settingsExist = Settings.find().count();
  if (settingsExist === 0){
    console.log('Loading settings');
    Settings.insert(settings)
  } else if (settingsExist > 1){
    console.log('Clearing settings');
    Settings.remove({});
  }
}

function loadAreas(area) {
  var alreadyExists = typeof Areas.findOne({ name : area.name }) === 'object';
  if (!alreadyExists) {
    Areas.insert(area)
  }
}

function loadEvent(event,i) {
  var alreadyExists = typeof Events.findOne({ title : event.title }) === 'object';

  if (!alreadyExists) {
    var area = Areas.findOne({name: event.area});
    if(area){
      event.area = area._id;
    }
    event.date = moment().add(i,'days').toJSON();
    Events.insert(event)
  }
}

function cleanUserNames() {
  Meteor.users.find({}).forEach(function(user){
    
    if (user.username && user.emails[0] && Meteor.users.find({username: user.username.toLowerCase()}).count() === 0) {
      Meteor.users.update({_id: user._id, "emails.address": user.emails[0].address}, 
        {
          $set: {
            username: user.username.toLowerCase(),
            "emails.$.address" : user.emails[0].address.toLowerCase()
          }
        });  
    }

  })
}

Meteor.startup(function () {
  cleanUserNames()
  var settings = YAML.eval(Assets.getText('settings.yml'));
  var areas = YAML.eval(Assets.getText('areas.yml'));
  var events = YAML.eval(Assets.getText('events.yml'));
  var users = YAML.eval(Assets.getText('users.yml'));

  loadSettings(settings);

  for (key in areas) if (areas.hasOwnProperty(key)) {
    loadAreas(areas[key]);
  }

  var i = 0;
  for (key in events) if (events.hasOwnProperty(key)) {
    loadEvent(events[key], i);
    i++;
  }

  for (key in users) if (users.hasOwnProperty(key)) {
    loadUser(users[key]);
  }

  if (ServiceConfiguration.configurations.find({service: 'facebook'}).count()===0) {
    ServiceConfiguration.configurations.insert({
      service: "facebook",
      appId: "1443500655956235",
      secret: "d343eb1dec70cea878b6055d97a18dfe"
    });
  }

  if (ServiceConfiguration.configurations.find({service: 'google'}).count()===0) {
    ServiceConfiguration.configurations.insert({
      service: "google",
      clientId: "163904196918-2j85kll0sg7c2em0nmbh01qkbct5duu1.apps.googleusercontent.com",
      secret: "mvsD9msqm2hTUXWo152s5hji"
    });
  }

});
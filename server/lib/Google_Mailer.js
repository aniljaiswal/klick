Google_Mailer = {};

Google_Mailer.creat_event = function (event_data) {
    var link_text = "\n\nFind you who you are meeting at http://www.klicktogether.com/events/" + event_data._id; 
    var config = Settings.findOne({});
    var calendar_owner = Meteor.users.findOne(config.calendarOwner);
    if(calendar_owner){
        var endDate = moment(event_data.date).add(1, 'hours').toDate();
        var options = {
        user: calendar_owner,
        data:{
          summary: event_data.title,
          start: {
            dateTime: event_data.date,
            timeZone: 'America/Chicago'
          },
          end: {
            dateTime: endDate,
            timeZone: 'America/Chicago'
          },
          anyoneCanAddSelf: false,
          guestsCanSeeOtherGuests: false,
          guestsCanInviteOthers: false,
          description: event_data.description+link_text,
          location: event_data.location.street + ", " + event_data.location.city,
          visibility: 'private'
        }
      };

      GoogleApi.post('calendar/v3/calendars/primary/events', options, function(res, data){
        var calId = data.id;
        Events.update(event_data._id, {$set: {gcalId: calId}});
      });
    }
}

Google_Mailer.update_event = function(event_data) {
    console.log('sending update email');
    var link_text = "\n\nFind you who you are meeting at http://www.klicktogether.com/events/" + event_data._id; 
    var config = Settings.findOne({});
    var calendar_owner = Meteor.users.findOne(config.calendarOwner);
    if(calendar_owner && event_data.gcalId){
        var endDate = moment(event_data.date).add(1, 'hours').toDate();
        var options = {
            user: calendar_owner,
            query:{
                sendNotifications: true,
            },
            data:{
                summary: event_data.title,
                attendees: event_data.invited,
                start: {
                dateTime: moment(event_data.date).format("YYYY-MM-DDTHH:mm:ssZ"),
                timeZone: 'America/Chicago'
            },
            end: {
                dateTime: moment(endDate).format("YYYY-MM-DDTHH:mm:ssZ"),
                timeZone: 'America/Chicago'
            },
                description: event_data.description +link_text,
                anyoneCanAddSelf: false,
                guestsCanSeeOtherGuests: false,
                guestsCanInviteOthers: false,
                location: event_data.location.street + ", " + event_data.location.city,
                visibility: 'private'
            }
        }
        GoogleApi.patch('calendar/v3/calendars/primary/events/' + event_data.gcalId+'?sendNotifications=true', options, function(res, data){});
    }
}

Google_Mailer.delete_event = function(event_data){
    var config = Settings.findOne({});
    var calendar_owner = Meteor.users.findOne(config.calendarOwner);
    if(calendar_owner){
        var options = {
            user: calendar_owner,
            query:{
                sendNotifications: true,
            }
        };
        GoogleApi.delete('calendar/v3/calendars/primary/events' + event_data.gcalId +'?sendNotifications=true', options, function(res, data){});
    }
}
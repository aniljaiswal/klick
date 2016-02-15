Meteor.methods({
    download_users: function() {
        var heading = true; // Optional, defaults to true
        var delimiter = "," // Optional, defaults to ",";
        var collection = Meteor.users.find().fetch();
        var output = collection.map(function(person){
            var output_person = {}

            output_person.id = person._id;
            output_person.email = person.emails[0].address;
            output_person.createdAt = person.createdAt;
            for (var key in Schemas.UserProfile._schema) {
                output_person["prof_"+key] = person.profile[key] || '';
                output_person["prof_"+key] = JSON.stringify(output_person["prof_"+key]).replace(',',';');
            }
            output_person.klicks = person.klicks ? person.klicks.join(';') : '';
            output_person.canceledEvents = person.canceledEvents ? person.canceledEvents.join(';') : '';

            return output_person
        });

        return exportcsv.exportToCSV(output,heading,delimiter);
    },
    download_users_by_id: function(ids) {
        var heading = true; // Optional, defaults to true
        var delimiter = "," // Optional, defaults to ",";
        var collection = Meteor.users.find({_id: {$in: ids}}).fetch();
        var output = collection.map(function(person){
            var output_person = {}

            output_person.id = person._id;
            output_person.email = person.emails[0].address;
            output_person.createdAt = person.createdAt;
            for (var key in Schemas.UserProfile._schema) {
                output_person["prof_"+key] = person.profile[key] || '';
                output_person["prof_"+key] = JSON.stringify(output_person["prof_"+key]).replace(',',';');
            }
            output_person.klicks = person.klicks ? person.klicks.join(';') : '';
            output_person.canceledEvents = person.canceledEvents ? person.canceledEvents.join(';') : '';

            return output_person
        });

        return exportcsv.exportToCSV(output,heading,delimiter);
    },
    download_events: function() {
        var heading = true; // Optional, defaults to true
        var delimiter = "," // Optional, defaults to ",";
        var collection = Events.find().fetch();
        var output = collection.map(function(event){
            var output_event = {}

            output_event.id = event._id;
            output_event.title = event.title || '';
            output_event.description = event.description || '';
            output_event.area = Areas.findOne({_id: event.area}).name || '';
            output_event.eventLimit = event.eventLimit || '';
            output_event.groupLimit = event.groupLimit || '';
            output_event.users = event.users ? event.users.join(';') : '';
            output_event.createdAt = event.createdAt;

            var g_a = []
            for (var i = event.groups.length - 1; i >= 0; i--) {
                var group = event.groups[i];
                g_a.push(group ? group.join('/') : '');
            };

            output_event.groups = g_a ? g_a.join(';') : '';

            for (var key in Schemas.AddressSchema._schema) {
                output_event["addr_"+key] = event.location[key] || '';
            }
            
            for (var key in output_event) {
                if (typeof output_event[key] === 'undefined') {
                    console.log(key)
                }
            }
            return output_event
        });

        return exportcsv.exportToCSV(output,heading,delimiter);
    },
});

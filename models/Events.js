Events = new Mongo.Collection('Events');

SimpleSchema.messages({
    wrongRole: "Wrong Role",
    eventFull: "The event is full"
});

Schemas.AddressSchema = new SimpleSchema({
    street: {
        type: String,
        max: 100
    },
    city: {
        type: String,
        max: 50
    },
    state: {
        type: String,
        autoform: {
            options: {'AL': 'AL', 'AK': 'AK', 'AZ': 'AZ', 'AR': 'AR', 'CA': 'CA', 'CO': 'CO', 'CT': 'CT', 'DC': 'DC', 'DE': 'DE', 'FL': 'FL', 'GA': 'GA', 'HI': 'HI', 'ID': 'ID', 'IL': 'IL', 'IN': 'IN', 'IA': 'IA', 'KS': 'KS', 'KY': 'KY', 'LA': 'LA', 'ME': 'ME', 'MD': 'MD', 'MA': 'MA', 'MI': 'MI', 'MN': 'MN', 'MS': 'MS', 'MO': 'MO', 'MT': 'MT', 'NE': 'NE', 'NV': 'NV', 'NH': 'NH', 'NJ': 'NJ', 'NM': 'NM', 'NY': 'NY', 'NC': 'NC', 'ND': 'ND', 'OH': 'OH', 'OK': 'OK', 'OR': 'OR', 'PA': 'PA', 'RI': 'RI', 'SC': 'SC', 'SD': 'SD', 'TN': 'TN', 'TX': 'TX', 'UT': 'UT', 'VT': 'VT', 'VA': 'VA', 'WA': 'WA', 'WV': 'WV', 'WI': 'WI', 'WY': 'WY'}
        }
    },
    zip: {
        type: String,
        regEx: /^[0-9]{5}$/
    }
});

Schemas.Events = new SimpleSchema({
    title: {
        type: String
    },
    description: {
        type: String,
        optional: true,
    },
    area: {
        type: String,
        label: 'Area',
        autoform: {
            options: function () {
                return _.map(Areas.find().fetch(), function (area) {
                    return {label: area.name, value: area._id};
                });
            }
        }
    },
    gcalId: {
        type: String,
        label: 'Gcal ID',
        optional: true,
        autoform: {
            omit: true
        }
    },
    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date};
            } else {
                this.unset();
            }
        },
        autoform: {
            omit: true
        }
    },
    eventLimit:{
        type: Number,
        label: 'Attendee Limit',
        min: 1
    },
    groupLimit:{
        type: Number,
        label: 'Group Size',
        min: 2
    },
    users: {
        type: [String],
        label: 'People registered',
        optional: true,
        custom: function(){
            if(this.field('eventLimit').isSet && this.value.length > this.field('eventLimit').value){
                return 'eventFull';
            } 
        },
        autoform: {
            omit: true
        },
        defaultValue: []
    },
    groups: {
        type: Array,
        label: 'Groups',
        optional: true,
        autoform: {
            omit: true
        }
    },
    'groups.$': {
        type: [String],
        label: 'Group',
        optional: true,
        autoform: {
            omit: true
        }
    },
    isLocked: {
        type: Boolean,
        label: "Event Locked",
        defaultValue: false,
        optional: true,
        autoform: {
            omit: true
        }
    },
    location: {
        type: Schemas.AddressSchema
    },
    manualSort: {
        type: Boolean,
        label: "Manual group sorting",
        defaultValue: false,
        optional: true,
        autoform: {
            omit: true
        }
    },
    date: {
        type: Date,
        label: 'Date',
        min: new Date(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker"
            }
        }
    },
    isHosted: {
        type: Boolean,
        label: "Community Hosted",
        defaultValue: false,
        optional: true,
    },
    hosts: {
        type: [String],
        label: 'Community Hosts',
        optional: true,
        autoform: {
            omit: true
        },
        defaultValue: []
    },
});

Events.attachSchema(Schemas.Events);

if (Meteor.isServer) {
    Events.allow({
        insert : function (userId, doc) {
            return true
        },
        update : function (userId, doc) {
            return true;
        },
        remove : function (userId, doc) {
            if(userId == doc._id || Roles.userIsInRole(userId, ['admin'])){
                return true;
            } else {
                return false;
            }
        }
    });

    Events.before.update(function (userId, doc, fieldNames, modifier, options) {
        var new_groups;
        var users = doc.users || [];
        var config = Settings.findOne({});
        var is_in_release_frame = moment().add(config.release_frame, 'hours').isAfter(doc.date);
        var no_shuffle = doc.manualSort || is_in_release_frame;
        var should_shuffle = false;
        var group_size = doc.groupLimit;
        var hosts = doc.hosts || null;

        // Adding new user to event
        if(modifier.$addToSet && modifier.$addToSet.users){
            var new_member = modifier.$addToSet.users;
            users.push(new_member);
            if(no_shuffle){
                new_groups = Groups.addToGroup(doc.groups,new_member, doc.groupLimit);
            } else {
                should_shuffle = true;
            }
            Meteor.users.update(new_member, {$addToSet: {klicks: doc._id}});

        // Removing user from event
        } else if (modifier.$pull && modifier.$pull.users) {
            var remove_member = modifier.$pull.users;
            users = _.filter(users, function(id){ return id !== remove_member});
            if(no_shuffle){
                new_groups = Groups.removeFromGroup(doc.groups,remove_member, doc.groupLimit);
            } else {
                should_shuffle = true;
            }
            Meteor.users.update(remove_member, {$pull: {klicks: doc._id}});
        }

        // Changed group limit
        if(modifier.$set && modifier.$set.groupLimit && !doc.manualSort){
            group_size = modifier.$set.groupLimit
            should_shuffle = true;
        }

         // Changed hosts
        if(modifier.$set && modifier.$set.hosts && !doc.manualSort){
            hosts = modifier.$set.hosts
            should_shuffle = true;
        }

        // Changed from manual to auto grouping
        if(modifier.$set && modifier.$set.manualSort === false && doc.manualSort){
            should_shuffle = true;
        }

        if (should_shuffle) {
            new_groups = Groups.shuffleIntoGroups(users, doc.groupLimit, hosts)
        }
        console.log(modifier)
        if (!modifier.$set) modifier.$set = {}
        if (new_groups) _.extend(modifier.$set,{groups: new_groups});
        console.log(modifier)
    });

    Events.after.insert(function (userId, doc){
        Google_Mailer.creat_event({
            _id: doc._id,
            date: doc.date,
            title: doc.title,
            description: doc.description,
            location: doc.location
        });
    })

    Events.after.update(function (userId, doc, fieldNames, modifier, options) {
        var invited = Meteor.users.find({_id: {$in: doc.users}}).fetch();
        var invited = invited.map(function(user){
            return { 
                email: user.emails[0].address,
                displayName: user.profile.firstName + " "+ user.profile.lastName
            }
        });

        Google_Mailer.update_event({
            _id: doc._id,
            date: doc.date,
            title: doc.title,
            description: doc.description,
            location: doc.location,
            invited: invited,
            gcalId: doc.gcalId
        });
    });

    Events.after.remove(function (userId, doc){
        Google_Mailer.delete_event({
            gcalId: doc.gcalId
        })
    });
}



    
  





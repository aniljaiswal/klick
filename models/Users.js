
Schemas.UserProfile = new SimpleSchema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    netid: {
      type: String,
      optional: false,
      label: 'NetID'
    },
    birthday: {
        type: Date,
        optional: true,
        defaultValue: new Date(),
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    tagline: {
        type: String,
        optional: true,
        label: 'Tagline'
    },
    gradYear: {
        type: Number,
        optional: true,
        label: 'Class of',
        min: 2000,
        autoform: {
            options: function () {
                var options = [];
                for (var i = 4 - 1; i >= 0; i--) {
                    var year = moment().year() + i;
                    options.push({label: year, value: year});
                };
                return options;
            }
        }
    },
    program: {
        type: String,
        optional: true,
        label: 'Kellogg Program',
        allowedValues: function(){
            var config = Settings.findOne({});
            return config.programs;
        },
    },
    section: {
        type: String,
        optional: true,
        label: 'Section',
        allowedValues: function(){
            var config = Settings.findOne({});
            return config.section;
        },
    },
    kwesttrip: {
        type: String,
        optional: true,
        label: 'KWEST Trip',
        allowedValues: function(){
            var config = Settings.findOne({});
            return config.kwesttrip;
        },
    },
    nationality: {
        type: String,
        optional: true,
        label: 'Nationality',
        allowedValues: function(){
            var config = Settings.findOne({});
            return config.countries;
        },
    }
});

Schemas.UserSchema = new SimpleSchema({
    username: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    emails: {
        type: [Object],
        optional: true,
        defaultValue: [],
        minCount: 0,
        autoform: {
            omit: true
        }
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date,
        autoform: {
            omit: true
        }
    },
    profile: {
        type: Schemas.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
            omit: true
        }
    },
    roles: {
        type: [String],
        optional: true,
        autoform: {
            omit: true
        }
    },
    klicks: {
        type: [String],
        optional: true,
        autoform: {
            omit: true
        }
    },
    canceledEvents: {
        type: [String],
        optional: true,
        autoform: {
            omit: true
        }
    }
});

Meteor.users.attachSchema(Schemas.UserSchema);

if (Meteor.isServer) {
    Meteor.users.allow({
        insert : function (userId, doc) {
            if(userId == doc._id || Roles.userIsInRole(userId, ['admin'])){
                return true;
            } else {
                return false;
            }
        },
        update : function (userId, doc) {
            if(userId == doc._id || Roles.userIsInRole(userId, ['admin'])){
                return true;
            } else {
                return false;
            }
        },
        remove : function (userId, doc) {
            if(userId == doc._id || Roles.userIsInRole(userId, ['admin'])){
                return true;
            } else {
                return false;
            }
        }
    });

    Accounts.validateNewUser(function (user) {
        if (user.services && user.services.google && user.services.google.accessToken) return true;
        
        var email_regex = new RegExp("^[A-Z0-9._%+-]+@[A-Z0-9._%+-]*northwestern\.edu$","i"); 
        
        if (user.emails.length >= 1){
            for (var i = user.emails.length - 1; i >= 0; i--) {
                if(email_regex.test(user.emails[i].address)) {
                    return true;
                }
            }
        } else {
            throw new Meteor.Error(403, "You must use a Northwestern University Email");
            return false;
        }
    });

    Accounts.onCreateUser(function(options, user) {
        user.emails = user.emails || []
        user.profile = options.profile || {};
        user.username = options.email.toLowerCase();

        if (user.services && user.services.google && user.services.google.accessToken) {
            user.profile.firstName = user.services.google.given_name;
            user.profile.lastName = user.services.google.family_name;
            user.username = user.services.google.email.toLowerCase();
            user.emails.push({address: user.services.google.email, verified: false});
            user.profile.netid = 'abc123';
        }

        return user;
    });
}



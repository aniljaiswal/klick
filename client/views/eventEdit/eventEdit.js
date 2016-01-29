Template['eventEdit'].helpers({
    'possible_hosts': function(){
        return Meteor.users.find({_id: {$in: this.users}}).fetch();
    },

    form_schema: function() {
        var that = this;
        var host_schema = new SimpleSchema({
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
                    type: "select2",
                    afFieldInput: {
                        multiple: true
                    },
                    options: function () {
                        return _.map(Meteor.users.find({_id: {$in: that.users}}).fetch(), function (user) {
                            return {label: user.profile.firstName + " " + user.profile.lastName , value: user._id};
                        });
                    }
                },
                defaultValue: []
            },
        });
        return host_schema;
    }
});

Template['eventEdit'].events({
});

Template['eventEdit'].onRendered(function(){
  AutoForm.addHooks('updateEventForm', {
    onSuccess: function (formType, result) {
      Router.go('event', {_id: this.docId});
      return false;
    }
  }); 
});



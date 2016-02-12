Template['signup'].helpers({
  error: function(){
    return Session.get('error')
  },
  UserSignUp: function() {
    return UserSignUp;
  }
});

Template['signup'].events({

});



AutoForm.addHooks('insertUserForm', {
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    this.event.preventDefault()
    var that = this;
    Accounts.createUser({
      email: insertDoc.email.toLowerCase(), 
      password : insertDoc.password,
      profile: {
        firstName: insertDoc.firstName,
        lastName: insertDoc.lastName,
        netid: insertDoc.netid
      }
    }, function(err){
      if (err) {
        if (err.reason === 'Username already exists.') err.reason = 'Email address already in use'
        that.done(new Error(err.reason));
        Session.set('error', err.reason);
        return false;
      } else {
        that.done();
        Router.go('userEdit', {_id: Meteor.userId});
        return false;
      }
    });
  },
}); 


var UserSignUp = new SimpleSchema({
  firstName: {
      type: String,
      optional: false,
  },
  lastName: {
      type: String,
      optional: false,
  },
  email: {
    type: String,
    optional: false,
    regEx: SimpleSchema.RegEx.Email,
    label: "Kellogg Email",
  },
  netid: {
      type: String,
      optional: false,
      label: 'NetID'
  },
  password: {
    type: String,
    label: "Password",
    min: 6,
    autoform: {
      type: 'password'
    },
  },
  passwordConfirmation: {
    type: String,
    autoform: {
      type: 'password'
    },
    min: 6,
    label: "Password confirmation",
    custom: function () {
      if (this.value != this.field('password').value) {
        return "passwordMissmatch";
      }
    }
  }
});

UserSignUp.messages({
  passwordMissmatch: "Passwords do not match"
});

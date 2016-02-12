Accounts.ui.config({
    forceEmailLowercase: true,
    forceUsernameLowercase: true,
    extraSignupFields: [
        {
            fieldName: 'firstName',
            fieldLabel: 'First name',
            inputType: 'text',
            visible: true,
            validate: function(value, errorFunction) {
              if (!value) {
                errorFunction("Please write your first name");
                return false;
              } else {
                return true;
              }
            }
        }, {
            fieldName: 'lastName',
            fieldLabel: 'Last name',
            inputType: 'text',
            visible: true,
        }
    ],
    requestPermissions:{
        facebook: ['user_birthday', 'user_education_history','user_friends','user_hometown',]
    },
})


# Klick

Klick is an automated "dinner with strangers" app. Users can sign up and fill out basic profile information and sign up for events. The app will organize random groups within events based on profile information. The grouping optimized for the highest average randomness. 

#### Basic user flow:
1. User signs up and fills out basic profile
2. User registers for events. 
3. The user's group is hidden until the event date is within the release frame. For example, if a dinner event is at 5pm and the release frame is 1 hour, the user will be able to see who they are eatgin with at 4pm.
4. A calendar invite is automatically sent to the user.
5. The user attends the event

<!-- toc -->
* [How to use](#how-to-use)
  * [Setup](#setup)
  * [Settings](#settings)
  * [Creating Events](#creating-events)
  * [Signing Up Users](#signing-up-users)
* [Architechure](#architechure)
  * [Packages used](#packages-used)
  * [Folder structure](#folder-structure) 
  * [Schema](#schema)
* [Deploying](#deploying)
  * [Dev](#dev)
  * [Staging](#staging)
  * [Prod](#prod)
* [License](#license)

<!-- toc stop -->

## How to use
Admin have the ability to edit events, users, areas and settings. Any user can be promoted and demoted to an admin. The app will automitcally create and admin account.

### Setup

1. Deploy the app
2. Login with the defulat admin account and enter basic profile information
3. Navigate to the Admin > Configuration tab
4. Create a couple "areas". These are the location groups that events will fall under
5. Set the release frame (in hours)
6. Set the calendar owner:
  1. Logout and go to the admin login page (/admin_login)
  2. Click google sign up
  3. Use the google account that will own the app's calendar
  4. Fill out basic profile info
  5. Logout and back into the admin account
  6. Navigate to the Admin > Configuration tab
  7. Select the google account from the calendar owner dropdown
  8. Click Update
7. Create events

### Settings

To veiw the app's settings, login as an admin and navigate to the Admin > Configuration tab. From there you can add, edit and remove areas.

### Creating Events

### Signing Up Users

## Architechure

### Packages used

* Meteor Core
  * meteor-platform
* Routing
  * [iron:router](https://github.com/EventedMind/iron-router)
  * [zimme:iron-router-active](https://github.com/zimme/meteor-iron-router-active)
* Collections
  * [aldeed:collection2](https://github.com/aldeed/meteor-collection2)
  * [dburles:collection-helpers](https://github.com/dburles/meteor-collection-helpers)
* Accounts
  * [accounts-password](https://github.com/meteor/meteor/tree/devel/packages/accounts-password)
  * [useraccounts:semantic-ui](https://github.com/meteor-useraccounts/semantic-ui)
* UI and UX
  * [fastclick](https://github.com/meteor/meteor/tree/devel/packages/fastclick)
  * [meteorhacks:fast-render](https://github.com/meteorhacks/fast-render)
  * [natestrauser:animate-css](https://github.com/nate-strauser/meteor-animate-css/)
  * [nooitaf:semantic-ui](https://github.com/nooitaf/meteor-semantic-ui)
* Security
  * [browser-policy](https://github.com/meteor/meteor/tree/devel/packages/browser-policy)
  * [audit-argument-checks](https://github.com/meteor/meteor/tree/devel/packages/audit-argument-checks)
  * [matteodem:easy-security](https://github.com/matteodem/meteor-easy-security)
* SEO
  * [manuelschoebel:ms-seo](https://github.com/DerMambo/ms-seo)
* Development
  * [less](https://github.com/meteor/meteor/tree/devel/packages/less)
  * [jquery](https://github.com/meteor/meteor/tree/devel/packages/jquery)
  * [underscore](https://github.com/meteor/meteor/tree/devel/packages/underscore)
  * [raix:handlebar-helpers](https://github.com/raix/Meteor-handlebar-helpers)

The "insecure" and "autopublish" packages are removed by default (they make your app vulnerable).

### Folder structure

```
client/ 				# Client folder
    compatibility/      # Libraries which create a global variable
    config/             # Configuration files (on the client)
	lib/                # Library files that get executed first
    startup/            # Javascript files on Meteor.startup()
    stylesheets         # LESS files
    modules/            # Meant for components, such as form and more(*)
	views/			    # Contains all views(*)
	    common/         # General purpose html templates
model/  				# Model files, for each Meteor.Collection(*)
private/                # Private files
public/                 # Public files
routes/                 # All routes(*)
server/					# Server folder
    fixtures/           # Meteor.Collection fixtures defined
    lib/                # Server side library folder
    publications/       # Collection publications(*)
    startup/            # On server startup
meteor-boilerplate		# Command line tool
```

(*) = the command line tool creates files in these folders

### Schema

## Deploying

### Dev
Dev hosting is done locally using the (meteor commandline tool)[https://www.meteor.com/tool]. To run the app locally:

1. `$ cd klick`
2. `$ meteor`
3. Go to (localhost:3000)[http://localhost:3000/]

### Staging
Staging is done using meteor's cloud hosting. The staging env uses its own database and does not mirror prod. To deploy to staging:

1. Get access to the staging domain from Nikhil
2. `$ cd klick`
3. `$ meteor deploy klick`
4. Go to (klick.meteor.com)[http://klick.meteor.com]

### Prod
The production server is hosted by (Modulus)[https://modulus.io/]. You must have the (modulus CLI tools)[http://help.modulus.io/customer/en_us/portal/articles/1701977-modulus-command-line] installed to deploy. To deploy:

1. Get access to the staging domain from Nikhil
2. `$ cd klick`
3. `$ modulus deploy`
4. Go to (klicktogether.com)[http://klicktogether.com]



## License
This boilerplate has an MIT License, see the LICENSE.txt for more information.

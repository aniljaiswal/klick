Groups = {};

Groups.addToGroup = function(groups, user, groupLimit) {
  if(!groups){
    groups = [];
    groups.push([user]);
  } else {
    var target;
    _.each(groups, function(group, index){
      if(group.length < groupLimit) target = index;
    });
    if(target){
      groups[target].push(user)
    } else {
      groups.push([user]);
    }
  }
  return groups;
}

Groups.removeFromGroup = function(groups, user, groupLimit) {
  for (var i = groups.length - 1; i >= 0; i--) {
    groups[i] = _.filter(groups[i], function(id){ return id !== user});
  };
  return groups;
}

Groups.addToRandomGroup = function(users, groupLimit) {

  return Groups.shuffleIntoGroups(users, groupLimit);
}

Groups.removeFromRandomGroup = function(groups, user, groupLimit) {
  console.log('Removing user: ' + user);
  for (var i = groups.length - 1; i >= 0; i--) {
    groups[i] = _.filter(groups[i], function(id){ return id !== user});
  };
  return groups;
}

//User IDS
Groups.shuffleIntoGroups = function(users, groupLimit){
  var numGroups = Math.ceil(users.length/groupLimit);
  var users = Meteor.users.find({_id: {$in: users}}).fetch();
  var dM = generateDMatrix(users);
  var groups = new Array(numGroups);
  users = shuffleArray(users);

  for(var i = 0; i < users.length; i++){
    var user = users[i];
    var bestFit;
    var bestFitDistance = -1;
    var insertEnd = false;

    for(var gi = 0; gi < numGroups && !insertEnd; gi++){
      if(!groups[gi]){
        groups[gi] = [user];
        insertEnd = true;
      } else {
        var gD = Groups.getGroupDistance(groups[gi].concat([user]), dM);
        if(gD > bestFitDistance){
          bestFitDistance = gD;
          bestFit = gi;
        }
      }
    }

    if(!insertEnd){
      groups[bestFit].push(user);
    }
  }

   var group_by_id = groups.map(function(group){
    return group.map(function(user){return user._id})
   });
  return group_by_id;
}

//User objects
Groups.getGroupDistance = function(group, matrix){
  var total = 0;
  var count = 0;
  if (group.length < 2) return 0;
  for(var i = 0; i < group.length; i++){
    var userA = group[i];
    for(var j = i+1; j < group.length; j++){
      var userB = group[j];
      count ++;
      if(matrix){
        total += matrix[userA._id][userB._id];
      } else {
        total += Groups.userDistance(userA,userB);
      }
    }
  }
  return total/count;
}

//User objects
function generateDMatrix(users){
  var m = {};
  for (var i = users.length - 1; i >= 0; i--) {
    var user = users[i];
     var userM = {};
     for (var j = users.length - 1; j >= 0; j--) {
       var compUser = users[j];
       userM[compUser._id] = Groups.userDistance(user, compUser);
     };
     m[user._id] = userM;
  };
  return m;
}

function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;
  if(array.length < 2) return array;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//User objects
Groups.userDistance = function(userA, userB) {
  var genderD = 0;
  if(!userA.profile || !userB.profile) return 100;
  if (userA.profile.gender !== userB.profile.gender) genderD = 1;

  var distance = genderD;
  return distance;
}

// On the server
Meteor.methods({
  getGroupDistance: function (group) {
    return Groups.getGroupDistance(group);
  }
});

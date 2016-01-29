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
        if(target < groups.length){
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
    groups = groups.filter(function(group){return group.length > 0});
    return groups;
}

Groups.addToRandomGroup = function(users, groupLimit,hosts) {
    return Groups.shuffleIntoGroups(users, groupLimit);
}

Groups.removeFromRandomGroup = function(users, groupLimit,hosts) {
    return Groups.shuffleIntoGroups(users, groupLimit,hosts);
}

//User IDS
Groups.shuffleIntoGroups = function(users, groupLimit, hosts){
    console.log(hosts)
    var numGroups = Math.ceil(users.length/groupLimit);
    var users = Meteor.users.find({_id: {$in: users}}).fetch();
    var hosts = Meteor.users.find({_id: {$in: hosts}}).fetch();
    var dM = generateDMatrix(users);
    var groups = new Array(numGroups);
    users = shuffleArray(users);

    if(hosts) {
        // seed using hosts if there are hosts
        hosts.splice(numGroups,hosts.length - numGroups);

        users = users.filter(function(user) {
            return hosts.indexOf(user._id) === -1;
        });

        for (var i = hosts.length - 1; i >= 0; i--) {
            var host = hosts[i];
            groups[i] = [host];
        };

    } 

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
                if(gD > bestFitDistance && groups[gi].length < groupLimit){
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

    group_by_id = group_by_id.filter(function(group){return group.length > 0});

    group_by_id.sort(function(a, b){
        return b.length - a.length; 
    });

    // no one eats alone
    if (group_by_id.length > 1) {
        var loner_group;
        var smallest_group = 0;
        for (var i = group_by_id.length - 1; i >= 0; i--) {
            if (group_by_id[i].length === 1) {
                loner_group = i;
            } else if (group_by_id[smallest_group].length > group_by_id[i].length) {
                smallest_group = i;
            }
        };

        if (loner_group){
            group_by_id[smallest_group].push(group_by_id[loner_group][0]);
            group_by_id.splice(loner_group, 1);
        }
    }

    return group_by_id;
}

Groups.getGroupDistanceFromIDs = function(group){
    var users = Meteor.users.find({_id: {$in: group}}).fetch();
    var gD = Groups.getGroupDistance(users);
    return gD;
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
    if (userA._id === userB._id) return 0;
    if(!userA.profile || !userB.profile) return 100;

    // console.log('\n====================================\n\nComparing:')
    // console.log(userA.profile)
    // console.log(userB.profile)
    var distance = 0;

    distance += (userA.profile.kwesttrip === userB.profile.kwesttrip) ? 0 : 100;

    if (userA.profile.gradYear && userB.profile.gradYear) {
        var a = userA.profile.section + userA.profile.gradYear.toString();
        var b = userB.profile.section + userB.profile.gradYear.toString();
        distance += (a === b) ? 0 : 50;
    }

    distance += (userA.profile.program === userB.profile.program) ? 0 : 30;

    distance += (userA.profile.gender === userB.profile.gender) ? 0 : 30;

    distance += (userA.profile.nationality === userB.profile.nationality) ? 0 : 50;

    if (userA.profile.gradYear && userB.profile.gradYear) {
        distance += Math.abs(userA.profile.gradYear - userB.profile.gradYear) * 5;
    }

    // console.log('\nDistance: ' + distance);
    // console.log('\n====================================\n')
    return distance;
}

// On the server
Meteor.methods({
    getGroupDistance: function (group) {
        return Groups.getGroupDistance(group);
    }
});


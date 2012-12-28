var Q = require('q');

//Adding this convenient function to Q.defer prototype since regular makeNodeResolver doesn't work with mongojs
Q.defer.prototype.makeMongodbResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 1) {
            self.resolve(value);
        }
        else{
            self.resolve();
        }
    };
};

module.exports = function(db){
    var rooms = db.collection('rooms');
    return {
        joinRoom: function(room_name, username){
            var deferred = Q.defer();
            rooms.findAndModify({
                query: { name: room_name },
                update: { $addToSet: { users: { username: username } } },
                new: true,
                upsert: true
            }, deferred.makeMongodbResolver());

            return deferred.promise;
        },

        leaveRoom: function(room_name, username){
            var deferred = Q.defer();

            rooms.update({ name: room_name }, { $pop: { users: { username: username}}}, deferred.makeMongodbResolver());

            return deferred.promise;
        }
    }
};
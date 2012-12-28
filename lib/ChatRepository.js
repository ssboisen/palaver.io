var Q = require('q');

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
            }, function(err, doc){
                if(err){
                    deferred.reject(new Error(err));
                }
                else{
                    deferred.resolve(doc);
                }
            });

            return deferred.promise;
        }
    }
};
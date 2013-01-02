"use strict";
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
    var users = db.collection('users');

    return function ChatRepository(){

        this.joinRoom = function(room_name, username){
            var deferred = Q.defer();
            rooms.findAndModify({
                query: { name: room_name },
                update: {
                    $addToSet: { users: { username: username } }
                },
                "new": true,
                upsert: true
            }, deferred.makeMongodbResolver());

            return deferred.promise;
        };

        this.leaveRoom = function(room_name, username){
            var deferred = Q.defer();

            rooms.update({ name: room_name }, { $pop: { users: { username: username}}}, deferred.makeMongodbResolver());

            return deferred.promise;
        };

        this.addMessageToRoom = function(room_name, message){
            var deferred = Q.defer();

            rooms.update({name: room_name}, { $push: { messages: message}}, deferred.makeMongodbResolver());

            return deferred.promise;
        };

        this.roomsForUser = function(username){
            var deferred = Q.defer();

            rooms.find({ "users.username" : username }, deferred.makeMongodbResolver());

            return deferred.promise;
        };

        this.findUser = function(username){
            var deferred = Q.defer();

            users.find({ username: username }, deferred.makeMongodbResolver());

            return deferred.promise.then(function(docs){
                if(docs.length === 1){
                    return docs[0];
                }

                return null;
            });
        };

        this.createUser = function(user){
            return this.findUser(user.username).then(function(existingUser){
                var deferred = Q.defer();

                if(!existingUser){
                    users.insert(user, deferred.makeMongodbResolver());
                }
                else{
                    throw new Error("User already exists");
                }

                return deferred.promise;
            });
        };
    };
};
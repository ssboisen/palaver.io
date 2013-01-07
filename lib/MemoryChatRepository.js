var Q = require('q')
  , util = require('util')
  , _ = require('underscore')
  , AbstractChatRepository = require('./AbstractChatRepository');

module.exports = MemoryChatRepository;

util.inherits(MemoryChatRepository, AbstractChatRepository);

function MemoryChatRepository(rooms, users){

  rooms = rooms || [];
  users = users || [];

  this.joinRoom = function(roomName, username){
    var room = _.find(rooms, function(room){ return room.name === roomName;});

    if(!room) {
      room = { name: roomName, users: [ ], messages: [] };
      rooms.push(room);
    }

    if(!_.any(room.users, function(user) { return user.username === username; })) {
      room.users.push({username: username});
    }

    return room;
  };

  this.leaveRoom = function(roomName, username){
    var room = _.find(rooms, function(room){ return room.name === roomName;});

    if(!room) return;

    var user = _.find(room.users, function(user) { return user.username === username;});

    if(!user) return;

    var index = room.users.indexOf(user);

    room.users.splice(index,1);

  };

  this.addMessageToRoom = function(roomName, message){
    var room = _.find(rooms, function(room){ return room.name === roomName; });

    if(room) {
      room.messages.push(message);
    }
  };

  this.roomsForUser = function(username){
    return _.filter(rooms, function(room) {
      return _.any(room.users, function(user){
        return user.username === username;
      });
    });
  };

  this.findUser = function(username){
    return _.find(users, function(user) { return user.username === username;});
  };
};





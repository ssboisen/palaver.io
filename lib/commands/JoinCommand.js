"use strict";

module.exports = function(io, chatRepo){
    return {
        commandName: "join",

        execute: function(socket, args){
            var room_name = args;
            var currentUser = { username: socket.handshake.user.username };

            chatRepo.joinRoom(room_name, currentUser.username).then(function(room){

                socket.broadcast["in"](room.name).emit('user-joined-room', {
                    user: currentUser,
                    room_name: room.name
                });

                socket.join(room_name);
                socket.emit('joined-room', room);

            }, function(error){
                console.log("Error while joining room: %j", error);
            });
        },

        helpText: "Used to join rooms, usage: /join name of room"
    };
};
var _ = require('underscore');

module.exports = function(io, chatRepo){
    return {
        commandName: "leave",
        execute: function(socket, args, room_name){
            var currentUser = { username: socket.handshake.user.username };
            var room_name = args || room_name;

            if(!room_name) {
                socket.emit('chat-error', { message: "Can't leave room without knowing which room it is you want to leave." })
            }

            socket.leave(room_name);

            chatRepo.leaveRoom(room_name, currentUser.username).then(function(){
                console.log("Arguments: %j", arguments);
                socket.emit('left-room', { room_name: room_name});
            }, function(error){
                console.log("Error: %j", error);
            });

            //        socket.emit('chat-error', { message: "You were not in the room that you tried to leave."});


        },
        helpText: "Used to leave rooms, usage: '/leave' to leave the current room, '/leave room 5' to leave room with name 'room 5'"
    };
};
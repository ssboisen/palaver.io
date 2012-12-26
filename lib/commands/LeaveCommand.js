var _ = require('underscore');

module.exports = function(io, rooms){
    return {
        commandName: "leave",
        execute: function(socket, args, room_name){
            var currentUser = { username: socket.handshake.user.username };
            var room_name = args || room_name;

            if(!room_name) {
                socket.emit('chat-error', { message: "Can't leave room without knowing which room it is you want to leave." })
            }

            socket.leave(room_name);

            var room = _.find(rooms, function(r) {
                return r.name === room_name;
            });

            if(room){
                var user = _.find(room.users, function(u) {
                    return u.username === currentUser.username;
                });

                if(user){
                    var userIndex = _.indexOf(room.users, user);
                    room.users.splice(userIndex, 1);
                    socket.emit('left-room', { room_name: room_name});
                }
                else {
                    socket.emit('chat-error', { message: "You were not in the room that you tried to leave."});
                }
            }
        },
        helpText: "Used to leave rooms, usage: '/leave' to leave the current room, '/leave room 5' to leave room with name 'room 5'"
    };
};
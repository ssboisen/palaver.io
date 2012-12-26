var _ = require('underscore');

module.exports = function(io, rooms){
    return {
        commandName: "join",
        execute: function(socket, args){
            var room_name = args;
            var currentUser = { username: socket.handshake.user.username };

            var room = _.find(rooms, function(r) {
                return r.name === room_name;
            });

            if(!room) {
                room = {
                    name: room_name,
                    users: [ ],
                    messages: []
                };

                rooms.push(room);
            }
            else if(_.any(room.users, function(u) { return u.username === currentUser.username;})){
                return;
            }


            room.users.push(currentUser);

            socket.broadcast.in(room.name).emit('user-joined-room', {
                user: currentUser,
                room_name: room.name
            });

            socket.join(room_name);
            socket.emit('joined-room', room);
        }
    };
}
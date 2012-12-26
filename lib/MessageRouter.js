var sanitize = require('validator').sanitize;

module.exports = function(io)
{
    return {
        routeMessage: function(messageData, socket) {
            var message = {
                date: new Date(),
                content: sanitize(messageData.content).entityEncode(),
                user: socket.handshake.user.username,
                room_name: messageData.room_name
            };

            io.sockets.in(message.room_name).emit('chat-message',  message);

            return message;
        }
    };
}
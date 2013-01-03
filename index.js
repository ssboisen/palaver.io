module.exports = Palaver

function Palaver(io, passport, db, config){

    var ChatRepository = require('./src/ChatRepository')(db),
        chatRepo = new ChatRepository(),
        commands = require('./src/commands')(io, chatRepo),
        commandHandler = require('./src/CommandHandler')(commands),
        messageRouter = require('./src/MessageRouter')(io),
        authSetup = require('./src/authSetup');

    authSetup(passport, chatRepo, io, config);

    io.on('connection', function (socket) {
        var currentUser = {
            username: socket.handshake.user.username
        };

        chatRepo.roomsForUser(currentUser.username).then(function(rooms){
            _.forEach(rooms, function(r) {
                socket.join(r.name);
                socket.emit('joined-room', r);
            });
        }, function(error){
            console.log("Error: %j", error);
        });

        socket.on('message', function (messageData) {

            if(!messageData.content)
            {
                return;
            }

            if(commandHandler.isCommand(messageData))
            {
                var commandInfo = commandHandler.extractCommandInfo(messageData);

                commandHandler.execute(socket,commandInfo.commandName,commandInfo.args, commandInfo.room_name);
            }
            else if(messageData.room_name)
            {
                var message = messageRouter.routeMessage(messageData, socket);

                chatRepo.addMessageToRoom(message.room_name, message).fail(function(error){
                    console.log("Error: %j", error);
                });
            }

        });
    });
}
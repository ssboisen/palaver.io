module.exports = Palaver

function Palaver(io, passport, config){

    var abstractChatRepository = require('./ChatRepository');
    var ChatRepository;

    if(config.chatRepository && !(config.chatRepository instanceof abstractChatRepository)) {
        throw new Error("config.chatRepository must be instance of ChatRepository");
    }
    else if(!config.chatRepository && config.db) {
        ChatRepository = require('./MongoDbChatRepository')(config.db);
    }
    else {
        throw new Error("You must either supply a ChatRepository instance as config.chatRepository or a mongojs database as config.db");
    }

    var chatRepo = new ChatRepository(),
        commands = require('./commands')(io, chatRepo),
        commandHandler = require('./CommandHandler')(commands),
        messageRouter = require('./MessageRouter')(io),
        authSetup = require('./authSetup');

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
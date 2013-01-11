var AbstractChatRepository = require('./AbstractChatRepository')
  , MemoryChatRepository = require('./MemoryChatRepository')
  , CommandHandler = require('./CommandHandler')
  , _ = require('underscore')
  , Q = require('q');

exports = module.exports = Palaver;
exports.AbstractChatRepository = AbstractChatRepository;
exports.MemoryChatRepository = MemoryChatRepository;
exports.CommandHandler = CommandHandler;

function Palaver(io, config){

    var chatRepo = createChatRepository(config),
        commands = require('./commands')(io, chatRepo),
        commandHandler = require('./CommandHandler')(commands),
        messageRouter = require('./MessageRouter')(io);
    
    io.on('connection', function (socket) {

        var currentUser = {
            username: socket.handshake.user.username
        };

        Q.when(chatRepo.roomsForUser(currentUser.username), function(rooms){
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

                Q.when(chatRepo.addMessageToRoom(message.room_name, message)).fail(function(error){
                    console.log("Error: %j", error);
                });
            }

        });
    });
}

function createChatRepository(config){

    if(config.chatRepository && config.chatRepository instanceof AbstractChatRepository) {
        return config.chatRepository;
    }
    else if(!config.chatRepository) {
      return new require('./MemoryChatRepository')();
    }
    else {
        throw new Error("config.chatRepository must be instance of AbstractChatRepository");
    }
}

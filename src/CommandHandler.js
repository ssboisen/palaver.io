"use strict";

var _ = require('underscore');
module.exports = function(commands) {
    var availableCommands = {};
    if(commands){
        availableCommands = _.reduce(commands,function(cm, c){
            cm[c.commandName] = c;
            return cm;
        },{});
    }
    return {
        execute: function(socket, commandName, args, room_name) {
            if(availableCommands[commandName]){
                availableCommands[commandName].execute(socket, args, room_name);
            }
            else {
                socket.emit('chat-error', { message: "Unknown command '" + commandName + "'. Use /help to get a list of available commands." });
            }
        },
        extractCommandInfo: function(messageData) {
            var commandData = messageData.content.substr(1);
            var splitIndex = commandData.indexOf(' ');
            var command = splitIndex !== -1 ? commandData.substr(0, splitIndex) : commandData;
            var args = splitIndex !== -1 ? commandData.substr(splitIndex + 1) : "";

            return {
                commandName: command,
                args: args,
                room_name: messageData.room_name
            };
        },
        isCommand: function(messageData){
            return messageData.content.charAt(0) === '/';
        }
    };
};
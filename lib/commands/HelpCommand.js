
var fs = require('fs'),
    _ = require('underscore'),
    commands = _.chain(fs.readdirSync(__dirname)).map(function(file) {
        if (file == "index.js" || file == "HelpCommand.js") return;
        var name = file.substr(0, file.indexOf('.'));

        return require('./' + name)(null, null);
    }).filter(function(c) {
        return c;
    });

var helpTexts = commands
    .filter(function(c){ return c.helpText; })
    .map(function(c) { return c.commandName + ": " + c.helpText; })
    .value();

module.exports = function(io, room){
    return {
        commandName: "help",
        execute: function(socket, args, room_name){
            socket.emit('chat-message', {
                date: new Date(),
                content: "These are the available commands:\r\n\r\n" + helpTexts.join("\r\n\r\n"),
                user: "palaver",
                room_name: room_name
            })
        }
    };
};
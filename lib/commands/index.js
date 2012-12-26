var fs = require('fs');

module.exports = function(commandHandler, io, rooms){
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") return;
        var name = file.substr(0, file.indexOf('.'));
        var command = require('./' + name)(io, rooms);
        commandHandler.registerCommand(command);
    });
}
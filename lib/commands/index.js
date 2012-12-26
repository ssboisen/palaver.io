var fs = require('fs');

module.exports = function(io, rooms){
    var commands = [];

    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") return;
        var name = file.substr(0, file.indexOf('.'));
        var command = require('./' + name)(io, rooms);
        commands.push(command);
    });

    return commands;
}
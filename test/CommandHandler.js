/*jshint node: true */
/*global describe: true, beforeEach: true, it: true */

var palaver = require('../'),
    commandHandler = palaver.CommandHandler,
    should = require('should'),
    _ = require('underscore');

describe('CommandHandler', function () {
    var cmdHandler;

    beforeEach(function () {
        cmdHandler = commandHandler();
    });


    describe('.extractCommandInfo(messageData)', function () {

        it('should extract command-name', function () {

            var cmdInfo = cmdHandler.extractCommandInfo({
                content: "/commandName"
            });

            cmdInfo.should.have.property('commandName').eql('commandName');
        });

        it('should extract args', function () {

            var cmdInfo = cmdHandler.extractCommandInfo({
                content: "/commandName arg1 arg2 arg3"
            });

            cmdInfo.should.have.property('args').eql('arg1 arg2 arg3');
        });

        it('should extract room-name', function () {
            var cmdInfo = cmdHandler.extractCommandInfo({
                content: "/commandName arg1 arg2 arg3",
                room_name: "roomName"
            });

            cmdInfo.should.have.property('room_name').eql('roomName');
        });

    });

    describe('.isCommand(messageData)', function () {

        it('should identify a command', function () {

            var command = cmdHandler.isCommand({
                content: "/command"
            });

            command.should.be.true;
        });

        it('should not recognice stuff that is not a command', function () {

            var command = cmdHandler.isCommand({
                content: "!command"
            });

            command.should.be.false;

            command = cmdHandler.isCommand({
                content: "command"
            });

            command.should.be.false;
        });
    });

    describe('.execute(socket, commandName, args, room_name)', function () {

        var cmd1Args;
        var cmd2Args;

        beforeEach(function () {

            cmd1Args = null;
            cmd2Args = null;

            cmdHandler = commandHandler(
                [{
                commandName: "commandName1",
                execute: function () { cmd1Args = arguments; }
            },
            {
                commandName: "commandName2",
                execute: function () { cmd2Args = arguments; }
            }
            ]);

        });

        it('should execute the correct command', function () {

            var args = ['socket', 'commandName1', 'arg2', 'roomName'];
            cmdHandler.execute.apply({}, args);

            cmd1Args.should.be.arguments;

            should.not.exist(cmd2Args);
        });

        it('should execute with correct arguments', function () {
            var args = ['socket', 'commandName1', 'arg2', 'roomName'];
            cmdHandler.execute.apply({}, args);

            cmd1Args[0].should.be.eql('socket');
            cmd1Args[1].should.be.eql('arg2');
            cmd1Args[2].should.be.eql('roomName');
        });

        it('should emit chat-error with unknown command', function () {
            var emitArgs;
            var args = [{
                emit: function () { emitArgs = arguments; }
            }, 'unknownCommand', 'arg', 'roomName' ];

            cmdHandler.execute.apply({}, args);

            emitArgs.should.be.arguments;

            emitArgs[0].should.be.eql('chat-error');
            emitArgs[1].should.have.property('message').match(/^Unknown command.+/);
        });

        it('should execute no command with unknown command', function () {

            var args = [{ emit: function () { }, }, 'unknownCommand', 'arg', 'roomName' ];

            cmdHandler.execute.apply({}, args);

            should.not.exist(cmd1Args);
            should.not.exist(cmd2Args);
        });
    });
});

/*jshint node: true */
/*global describe: true, beforeEach: true, it: true */

var palaver = require('../'),
    MemoryChatRepository = palaver.MemoryChatRepository,
    should = require('should');

describe('MemoryChatRepository', function () {
    var memoryChatRepository;
    var rooms;

    describe(".joinRoom(roomName, username)", function () {

        beforeEach(function () {
            rooms = [];
            memoryChatRepository = new MemoryChatRepository(rooms);
        });

        it('should add user to room if not already in room', function () {

            var room = memoryChatRepository.joinRoom("room", "user");

            room.should.have.property('users').with.lengthOf(1);
            room.should.have.property('users').includeEql({ username: "user", online: true});
        });

        it('should not add user to room if already in room', function () {

            rooms.push({ name: "room", users: [ { username: "user"} ], messages: []});

            var room = memoryChatRepository.joinRoom("room", "user");

            room.should.have.property('users').with.lengthOf(1);
            room.should.have.property('users').includeEql({ username: "user"});
        });

        it('should add the room if it hasn\'t already been created', function () {
            var room = memoryChatRepository.joinRoom("room", "user");

            rooms.should.includeEql(room);
        });

        it('should not duplicate rooms', function () {
            rooms.push({ name: "room", users: [], messages: []});

            memoryChatRepository.joinRoom("room", "user");

            rooms.should.have.lengthOf(1);
        });

        it('should keep existing rooms when adding rooms', function () {
            var room1 = { name: "room", users: [], messages: []};
            rooms.push(room1);

            var room2 = memoryChatRepository.joinRoom("room2", "user");

            rooms.should.have.lengthOf(2);
            rooms.should.includeEql(room1);
            rooms.should.includeEql(room2);
        });

        it('should keep existing users in room when adding user', function () {
            rooms.push({name: "room", users: [ { username: "user"}], messages: []});

            var room = memoryChatRepository.joinRoom("room", "user2");

            room.should.have.property('users').with.lengthOf(2);
            room.should.have.property('users').includeEql({ username: "user"});
            room.should.have.property('users').includeEql({ username: "user2", online: true});
        });
    });

    describe('.leaveRoom(roomName, username)', function () {

        beforeEach(function () {
            rooms = [];
            memoryChatRepository = new MemoryChatRepository(rooms);
        });

        it('should do nothing if leaving room that user is not in', function () {
            rooms.push({ name: "room", users: [], messages: []});

            (function () {
                memoryChatRepository.leaveRoom("room", "user");
            }).should.not.throw();

            rooms.should.have.lengthOf(1);
        });

        it('should do nothing when leaving room that doesn\'t exist', function () {
            (function () {
                memoryChatRepository.leaveRoom("room", "user");
            }).should.not.throw();

            rooms.should.have.lengthOf(0);
        });

        it('should be removed from room when leaving', function () {
            var room = { name: "room", users: [{ username: "user1" }, {username: "user2"}, {username: "user3" }], messages: []};
            rooms.push(room);

            memoryChatRepository.leaveRoom("room", "user2");

            room.should.have.property("users").with.lengthOf(2);
            room.should.have.property("users").not.includeEql({ username: "user2"});
        });
    });

    describe('.addMessageToRoom(roomName, message)', function () {

        var message = { content: "the message" };

        beforeEach(function () {
            rooms = [];
            memoryChatRepository = new MemoryChatRepository(rooms);
        });

        it('should add message to room', function () {
            var room = { name: "room", users: [{ username: "user" }], messages: [] };
            rooms.push(room);

            memoryChatRepository.addMessageToRoom("room", message);

            room.should.have.property("messages").includeEql(message);
        });

        it('should do nothing if room doesn\'t exist', function () {
            (function () {
                memoryChatRepository.addMessageToRoom("room", message);
            }).should.not.throw();

            rooms.should.have.lengthOf(0);
        });
    });

    describe('.roomsForUser(username)', function () {

        var room1 = { name: "room", users: [{ username: "user" }], messages: []};
        var room2 = { name: "room", users: [{ username: "user" }, { username: "user2" }], messages: []};
        var room3 = { name: "room", users: [{ username: "user2" }], messages: []};

        beforeEach(function () {
            rooms = [];
            memoryChatRepository = new MemoryChatRepository(rooms);
        });

        it('should find the rooms the user is in', function () {
            rooms.push(room1);
            rooms.push(room2);

            var foundRooms = memoryChatRepository.roomsForUser("user");

            foundRooms.should.have.lengthOf(2);
            foundRooms.should.includeEql(room1);
            foundRooms.should.includeEql(room2);
        });

        it('should not find the rooms the user is not in', function () {
            rooms.push(room1);
            rooms.push(room3);

            var foundRooms = memoryChatRepository.roomsForUser("user");

            foundRooms.should.have.lengthOf(1);
            foundRooms.should.includeEql(room1);
        });

    });

    describe('.userConnected(username)', function () {
        var users = [];

        beforeEach(function () {
            users = [];
            rooms = [];
            memoryChatRepository = new MemoryChatRepository(rooms, users);
        });

        it('should increment connectionCount', function() {
          var user = { username: 'testuser', connectionCount: 0 };
          users.push(user);

          var returnedUser = memoryChatRepository.userConnected('testuser');
          returnedUser.connectionCount.should.equal(1);
        });

        it('should set online to true', function () {
          var user = { username: 'testuser', connectionCount: 0 };
          users.push(user);

          var returnedUser = memoryChatRepository.userConnected('testuser');
          returnedUser.online.should.equal(true);
        });

        it('should set online to true in rooms', function () {
          var user = { username: 'user', connectionCount: 0 };
          var room = { name: "room", users: [{ username: "user", online: false }], messages: []};
          users.push(user);
          rooms.push(room);

          memoryChatRepository.userConnected('user');

          room.users.should.includeEql({ username: 'user', online: true });
        });
    });

    describe('.userDisconnected(username)', function () {
        var users = [];

        beforeEach(function () {
            users = [];
            rooms = [];
            memoryChatRepository = new MemoryChatRepository(rooms, users);
        });

        it('should decrement connectionCount', function() {
          var user = { username: 'testuser', connectionCount: 2 };
          users.push(user);

          var returnedUser = memoryChatRepository.userDisconnected('testuser');
          returnedUser.connectionCount.should.equal(1);
        });

        it('should set online to false when connectionCount is 0', function () {
          var user = { username: 'testuser', connectionCount: 1 };
          users.push(user);

          var returnedUser = memoryChatRepository.userDisconnected('testuser');
          returnedUser.connectionCount.should.equal(0);
          returnedUser.online.should.equal(false);
        });

        it('should set online to false in rooms', function () {
          var user = { username: 'user', connectionCount: 1 };
          var room = { name: "room", users: [{ username: "user", online: true }], messages: []};
          users.push(user);
          rooms.push(room);

          memoryChatRepository.userDisconnected('user');

          room.users.should.includeEql({ username: 'user', online: false });
        });
    });
});

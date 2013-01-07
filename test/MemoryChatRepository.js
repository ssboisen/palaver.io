var palaver = require('../')
  , MemoryChatRepository = palaver.MemoryChatRepository
  , should = require('should');

describe('MemoryChatRepository', function() {
  var memoryChatRepository;
  var rooms;

  describe(".joinRoom(roomName, username)", function() {

    beforeEach(function(){
      rooms = [];
      memoryChatRepository = new MemoryChatRepository(rooms);
    });

    it('should add user to room if not already in room', function(){

      var room = memoryChatRepository.joinRoom("room","user");

      room.should.have.property('users').with.lengthOf(1);
      room.should.have.property('users').includeEql({ username: "user"});
    });

    it('should not add user to room if already in room', function(){

      rooms.push({ name: "room", users: [ { username: "user"} ], messages: []});

      var room = memoryChatRepository.joinRoom("room","user");

      room.should.have.property('users').with.lengthOf(1);
      room.should.have.property('users').includeEql({ username: "user"});
    });

    it('should add the room if it hasn\'t already been created', function(){
      var room = memoryChatRepository.joinRoom("room","user");

      rooms.should.includeEql(room);
    });

    it('should not duplicate rooms', function() {
      rooms.push({ name: "room", users: [], messages: []});

      memoryChatRepository.joinRoom("room", "user");

      rooms.should.have.lengthOf(1);
    });

    it('should keep existing rooms when adding rooms', function() {
      var room1 = { name: "room", users: [], messages: []};
      rooms.push(room1);

      var room2 = memoryChatRepository.joinRoom("room2", "user");

      rooms.should.have.lengthOf(2);
      rooms.should.includeEql(room1);
      rooms.should.includeEql(room2);
    });

    it('should keep existing users in room when adding user', function(){
      rooms.push({name: "room", users: [ { username: "user"}], messages: []});

      var room = memoryChatRepository.joinRoom("room", "user2");

      room.should.have.property('users').with.lengthOf(2);
      room.should.have.property('users').includeEql({ username: "user"});
      room.should.have.property('users').includeEql({ username: "user2"});
    })
  });

  describe('.leaveRoom(roomName, username)', function() {

    beforeEach(function(){
      rooms = [];
      memoryChatRepository = new MemoryChatRepository(rooms);
    });

    it('should do nothing if leaving room that user is not in', function() {
      rooms.push({ name: "room", users: [], messages: []});

      (function () {
        memoryChatRepository.leaveRoom("room", "user")
      }).should.not.throw();

      rooms.should.have.lengthOf(1);
    });

    it('should do nothing when leaving room that doesn\'t exist', function(){
      (function () {
        memoryChatRepository.leaveRoom("room", "user")
      }).should.not.throw();

      rooms.should.have.lengthOf(0);
    });

    it('should be removed from room when leaving', function(){
      var room = { name: "room", users: [{ username: "user1" }, {username: "user2"}, {username: "user3" }], messages: []};
      rooms.push(room);

      memoryChatRepository.leaveRoom("room", "user2");

      room.should.have.property("users").with.lengthOf(2);
      room.should.have.property("users").not.includeEql({ username: "user2"});
    });
  });

  describe('.addMessageToRoom(roomName, message)', function(){

    var message = { content: "the message" };

    beforeEach(function(){
      rooms = [];
      memoryChatRepository = new MemoryChatRepository(rooms);
    });

    it('should add message to room', function(){
      var room = { name: "room", users: [{ username: "user" }], messages: [] };
      rooms.push(room);

      memoryChatRepository.addMessageToRoom("room", message);

      room.should.have.property("messages").includeEql(message);
    });

    it('should do nothing if room doesn\'t exist', function(){
      (function(){
        memoryChatRepository.addMessageToRoom("room", message);
      }).should.not.throw();

      rooms.should.have.lengthOf(0);
    });
  });

  describe('.roomsForUser(username)', function(){

    var room1 = { name: "room", users: [{ username: "user" }], messages: []};
    var room2 = { name: "room", users: [{ username: "user" }, { username: "user2" }], messages: []};
    var room3 = { name: "room", users: [{ username: "user2" }], messages: []};

    beforeEach(function(){
      rooms = [];
      memoryChatRepository = new MemoryChatRepository(rooms);
    });

    it('should find the rooms the user is in', function(){
      rooms.push(room1); rooms.push(room2);

      var foundRooms = memoryChatRepository.roomsForUser("user");

      foundRooms.should.have.lengthOf(2);
      foundRooms.should.includeEql(room1);
      foundRooms.should.includeEql(room2);
    });

    it('should not find the rooms the user is not in', function(){
      rooms.push(room1); rooms.push(room3);

      var foundRooms = memoryChatRepository.roomsForUser("user");

      foundRooms.should.have.lengthOf(1);
      foundRooms.should.includeEql(room1);
    });

  });
});

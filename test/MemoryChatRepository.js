var palaver = require('../')
  , MemoryChatRepository = palaver.MemoryChatRepository
  , should = require('should');

describe('MemoryChatRepository', function() {
  var memoryChatRepository;

  describe(".joinRoom(roomName, username)", function() {

    var rooms;

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
});

"use strict";

module.exports = ChatRepository;

function ChatRepository() {
}

ChatRepository.prototype.joinRoom = function(roomName, username){
    throw new Error('ChatRepository#joinRoom must be overridden by subclass');
};

ChatRepository.prototype.leaveRoom = function(roomName, username){
    throw new Error('ChatRepository#leaveRoom must be overridden by subclass');
};

ChatRepository.prototype.addMessageToRoom = function(roomName, message){
    throw new Error('ChatRepository#addMessageToRoom must be overridden by subclass');
};

ChatRepository.prototype.roomsForUser = function(userName){
    throw new Error('ChatRepository#roomsForUser must be overridden by subclass');
};

ChatRepository.prototype.findUser = function(userName){
    throw new Error('ChatRepository#findUser must be overridden by subclass');
};
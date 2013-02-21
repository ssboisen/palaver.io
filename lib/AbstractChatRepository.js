"use strict";

module.exports = AbstractChatRepository;

function AbstractChatRepository() {
}

AbstractChatRepository.prototype.joinRoom = function(roomName, username){
    throw new Error('AbstractChatRepository#joinRoom must be overridden by subclass');
};

AbstractChatRepository.prototype.leaveRoom = function(roomName, username){
    throw new Error('AbstractChatRepository#leaveRoom must be overridden by subclass');
};

AbstractChatRepository.prototype.addMessageToRoom = function(roomName, message){
    throw new Error('AbstractChatRepository#addMessageToRoom must be overridden by subclass');
};

AbstractChatRepository.prototype.roomsForUser = function(userName){
    throw new Error('AbstractChatRepository#roomsForUser must be overridden by subclass');
};

AbstractChatRepository.prototype.findUser = function(userName){
    throw new Error('AbstractChatRepository#findUser must be overridden by subclass');
};

AbstractChatRepository.prototype.userConnected = function(userName) {
    throw new Error('AbstractChatRepository#userConnected must be overridden by subclass');
};

AbstractChatRepository.prototype.userDisconnected = function(userName) {
    throw new Error('AbstractChatRepository#userDisconnected must be overridden by subclass');
};

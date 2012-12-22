'use strict';

var services = angular.module('services', []).
  value('version', '0.1');

services.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });

services.factory('pubsub', function() {
        var cache = {};
        return {
            publish: function() {
                var topic = arguments[0];
                var args = Array.prototype.slice.call(arguments,1);
                cache[topic] && $.each(cache[topic], function() {
                    this.apply(null, args);
                });
            },

            subscribe: function(topic, callback) {
                if(!cache[topic]) {
                    cache[topic] = [];
                }
                cache[topic].push(callback);
                return [topic, callback];
            },

            unsubscribe: function(handle) {
                var t = handle[0];
                cache[t] && d.each(cache[t], function(idx){
                    if(this == handle[1]){
                        cache[t].splice(idx, 1);
                    }
                });
            }
        }
    });

function RoomController($scope, $timeout, socket, pubsub){

    $scope.rooms = [];
    $scope.selectedRoom = null;
    $scope.errorMessage = null;

    $scope.setActiveRoom = function(room) {
      $scope.selectedRoom = room;
      pubsub.publish('selectedRoomChanged', $scope.selectedRoom);
    };

    socket.on('left-room', function(message){
        var room = _.find($scope.rooms, function(r){
            return r.name === message.room_name;
        });

        var index = $scope.rooms.indexOf(room);

        $scope.rooms.splice(index, 1);

        if($scope.selectedRoom === room){
            $scope.setActiveRoom($scope.rooms[(index - 1) % $scope.rooms.length]);
        }
    });

    $scope.leaveRoom = function(room) {
        socket.emit('message', {content: '/leave ' + room.name });
    }
	socket.on('chat-message', function(message) {
        var room = _.find($scope.rooms, function(r) {
            return r.name === message.room_name;
        });

        if(room){
            room.messages.push({
                    user: message.user,
                    content: message.content,
                    date: message.date
                });
        }
        else {
            console.error("Received chat-message for room which I had not joined: " + message.room_name);
        }

	});

    socket.on('joined-room', function(room){
        $scope.rooms.push(room);

        $scope.setActiveRoom(room);
    });

    socket.on('user-joined-room', function(message) {
        var room = _.find($scope.rooms, function(r) {
            return r.name === message.room_name;
        });

        room.users.push(message.user);
    });

    socket.on('chat-error', function(error){
        $scope.errorMessage = error.message;
        $timeout(function() {
            $scope.errorMessage = null;
        }, 5000);
    });
}

function MessageController($scope, socket, pubsub) {

	$scope.message = "";
    $scope.selectedRoom = null;
    pubsub.subscribe('selectedRoomChanged', function(room) {
        $scope.selectedRoom = room;
    });

	$scope.sendmsg = function() {
		if($scope.message){
            var message = {
                content: $scope.message
            }
            if($scope.selectedRoom) {
                message.room_name = $scope.selectedRoom.name;
            }
			socket.emit('message', message);

			$scope.message = "";
		}
	};
}

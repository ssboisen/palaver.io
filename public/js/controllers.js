function RoomController($scope, socket, pubsub){

    $scope.rooms = [{ name: "Room 1", messages: [], users: [] }, { name: "Room 2", messages: [], users: [] }];
    $scope.selectedRoom = null;

    $scope.setActiveRoom = function(room) {
      $scope.selectedRoom = room;
      pubsub.publish('selectedRoomChanged', $scope.selectedRoom);
    };
	
	socket.on('new-message', function(data) {



        var room = _.find($scope.rooms, function(r) {
            return r.name === data.room;
        });

        if(room){
            if(!_.any(room.users, function(u) { return u.username === data.user; })){
                room.users.push({
                    username: data.user
                });
            }

            room.messages.push({
                    user: data.user,
                    content: data.message,
                    date: data.date
                });
        }
	});
}

function MessageController($scope, socket, pubsub) {

	$scope.message = "";
    $scope.selectedRoom = null;
    pubsub.subscribe('selectedRoomChanged', function(room) {
        $scope.selectedRoom = room;
    });

	$scope.sendmsg = function() {
		if($scope.message !== "" && $scope.selectedRoom){
			socket.emit('new-message', {
				message: $scope.message,
                room: $scope.selectedRoom.name
			});

			$scope.message = "";
		}
	};
}

function RoomController($scope, socket, pubsub){

    $scope.rooms = [{ name: "Room 1", messages: [] }];
    $scope.selectedRoom = null;

    $scope.setActiveRoom = function(room) {
      $scope.selectedRoom = room;
      pubsub.publish('selectedRoomChanged', $scope.selectedRoom);
    };

	$scope.users = [];
	
	socket.on('new-message', function(data) {

		if(!_.any($scope.users, function(u) { return u.username === data.user; })){
			$scope.users.push({
				username: data.user
			});
		}

        var room = _.find($scope.rooms, function(r) {
            return r.name === data.room;
        });

        if(room){
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
		if($scope.message !== "" && selectedRoom){
			socket.emit('new-message', {
				message: $scope.message,
                room: selectedRoom.name
			});

			$scope.message = "";
		}
	};
}

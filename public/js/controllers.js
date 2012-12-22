function RoomController($scope, socket, pubsub){

    $scope.rooms = [{ name: "Room 1", messages: [] }];
    $scope.selectedRoom = $scope.rooms[0];

    $scope.setActiveRoom = function(room) {
      $scope.selectedRoom = room;
      console.log($scope.selectedRoom);
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
    var selectedRoom = null;
    pubsub.subscribe('selectedRoomChanged', function(room) {
       selectedRoom = room;
    });

	$scope.sendmsg = function() {
		if($scope.message !== ""){
			socket.emit('new-message', {
				message: $scope.message,
                room: selectedRoom.name
			});

			$scope.message = "";
		}
	};
}

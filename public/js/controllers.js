function RoomController($scope, socket){

	$scope.messages = [];
	$scope.users = [];
	
	socket.on('new-message', function(data) {

		if(!_.any($scope.users, function(u) { return u.username === data.user; })){
			$scope.users.push({
				username: data.user
			});
		}

		$scope.messages.push({
			user: data.user,
			content: data.message,
			date: data.date
		});
	});
}

function MessageController($scope, socket) {

	$scope.message = "";

	$scope.sendmsg = function() {
		if($scope.message !== ""){
			socket.emit('new-message', {
				message: $scope.message 
			});

			$scope.message = "";
		}
	};
}

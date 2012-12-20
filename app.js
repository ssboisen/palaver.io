var express = require('express'),
 routes = require('./routes'),
 http = require('http'),
 app = express(),
 server = http.createServer(app),
 io = require('socket.io').listen(server),
 sanitize = require('validator').sanitize;

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

io.sockets.on('connection', function (socket) {
	socket.on('new-message', function (data) {
		io.sockets.emit('new-message', { 
				date: new Date(),
				message: sanitize(data.message).xss(),
				user: 'unknown'
		});
	});
});

server.listen(process.env.PORT || 3000)

console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env)

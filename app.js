var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    connect = require('express/node_modules/connect'),
    app = express(),
    sessionSecret = "palaver is the best",
    sessionKey = "palaver.sid",
    cookieParser = express.cookieParser(sessionSecret),
    sessionStore = new connect.middleware.session.MemoryStore(),
    server = http.createServer(app),
    sanitize = require('validator').sanitize,
    io = require('socket.io').listen(server),
    passport = require('passport'),
    passportSocketIo = require('passport.socketio'),
    flash = require('connect-flash'),
    LocalStrategy = require('passport-local').Strategy,
    _ = require('underscore');

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
    app.use(cookieParser);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ store: sessionStore, key: sessionKey }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}
app.get('/', ensureAuthenticated, routes.index);

app.get('/login', routes.login );

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true  }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    if(id === 1) { done(null, {
        id: 1,
        username: "ssb",
        password: "password"
    }); }
    else if(id === 2) { done(null, {
        id: 2,
        username: "mhs",
        password: "password"
    })}
});

passport.use(new LocalStrategy(function(username, password, done){
    process.nextTick(function() {
        if(username === "ssb" && password === "password") {
            done(null, { id: 1, username: "ssb", password: "password"});
        }
        else if(username === "mhs" && password === "password") {
            done(null, { id: 2, username: "mhs", password: "password" });
        }
        else {
            done(null, false, { message: 'Invalid username or password' });
        }

    });
}));

io.configure(function (){
    io.set("authorization", passportSocketIo.authorize({
        sessionKey:    sessionKey,      //the cookie where express (or connect) stores its session id.
        sessionStore:  sessionStore,     //the session store that express uses
        sessionSecret: sessionSecret, //the session secret to parse the cookie
        fail: function(data, accept) {     // *optional* callbacks on success or fail
            accept(null, false);             // second param takes boolean on whether or not to allow handshake
        },
        success: function(data, accept) {
            accept(null, true);
        }
    }));
});

var messageRouter = MessageRouter(io);
var rooms = [];
io.on('connection', function (socket) {
    var currentUser = {
        username: socket.handshake.user.username
    };

    var rooms_already_in = _.filter(rooms, function(r){
        return _.any(r.users, function(u) {return u.username === currentUser.username;});
    });

    _.forEach(rooms_already_in, function(r) {
        socket.join(r.name);
        socket.emit('joined-room', r);
    });

    socket.on('message', function (messageData) {
        if(messageData.content.charAt(0) === '/') //command
        {
            var commandData = messageData.content.substr(1);
            var splitIndex = commandData.indexOf(' ');
            var command = commandData.substr(0, splitIndex);
            var args = commandData.substr(splitIndex + 1);

            if(command === 'join')
            {
                var room_name = args;

                var room = _.find(rooms, function(r) {
                    return r.name === room_name;
                });

                if(!room) {
                    room = {
                        name: room_name,
                        users: [ ],
                        messages: []
                    };

                    rooms.push(room);
                }
                else if(_.any(room.users, function(u) { return u.username === currentUser.username;})){
                    return;
                }

                room.users.push(currentUser);

                socket.broadcast.in(room.name).emit('user-joined-room', {
                    user: currentUser,
                    room_name: room.name
                });

                socket.join(room_name);
                socket.emit('joined-room', room);
            }
        }
        else
        {
            var message = messageRouter.routeMessage(messageData, socket);

            var room = _.find(rooms, function(room) {
                return room.name === message.room_name;
            });

            room.messages.push(message);
        }

    });
});

server.listen(process.env.PORT || 3000)

console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env)

function MessageRouter(io)
{
    return {
        routeMessage: function(messageData, socket) {
            var message = {
                date: new Date(),
                content: sanitize(messageData.content).xss(),
                user: socket.handshake.user.username,
                room_name: messageData.room_name
            };

            io.sockets.in(message.room_name).emit('chat-message',  message);

            return message;
        }
    };
}
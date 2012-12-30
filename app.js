var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    connect = require('express/node_modules/connect'),
    app = express(),
    sessionSecret = "palaver is the best",
    sessionKey = "palaver.sid",
    cookieParser = express.cookieParser(sessionSecret),
    MemoryStore = new connect.middleware.session.MemoryStore(),
    MongoStore = require('connect-mongo')(express),
    sessionStore = new MongoStore({
        db: 'palaver'
    }),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    passport = require('passport'),
    passportSocketIo = require('passport.socketio'),
    flash = require('connect-flash'),
    LocalStrategy = require('passport-local').Strategy,
    _ = require('underscore'),
    db = require('mongojs')('palaver'),
    ChatRepository = require('./lib/ChatRepository')(db),
    chatRepo = new ChatRepository(),
    commands = require('./lib/commands')(io, chatRepo),
    commandHandler = require('./lib/CommandHandler')(commands),
    messageRouter = require('./lib/MessageRouter')(io);

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
    done(null, user.username);
});

passport.deserializeUser(function(username, done) {
    chatRepo.findUser(username).then(function(user){
        done(null, user);
    }, function(error){
        console.error("Error: ", error);
    });
});

passport.use(new LocalStrategy(function(username, password, done){
    chatRepo.findUser(username).then(function(user){
        if(user.password === password){
            done(null, user);
        }
        else{
            done(null,false, { message: 'Invalid username or password' } );
        }
    }, function(error){
        console.error("Error: ", error);
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

io.on('connection', function (socket) {
    var currentUser = {
        username: socket.handshake.user.username
    };

    chatRepo.roomsForUser(currentUser.username).then(function(rooms){
        _.forEach(rooms, function(r) {
            socket.join(r.name);
            socket.emit('joined-room', r);
        });
    }, function(error){
        console.log("Error: %j", error);
    });

    socket.on('message', function (messageData) {

        if(!messageData.content)
        {
            return;
        }

        if(commandHandler.isCommand(messageData))
        {
            var commandInfo = commandHandler.extractCommandInfo(messageData);

            commandHandler.execute(socket,commandInfo.commandName,commandInfo.args, commandInfo.room_name);
        }
        else if(messageData.room_name)
        {
            var message = messageRouter.routeMessage(messageData, socket);

            chatRepo.addMessageToRoom(message.room_name, message).fail(function(error){
                console.log("Error: %j", error);
            });
        }

    });
});

server.listen(process.env.PORT || 3000)

console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env)
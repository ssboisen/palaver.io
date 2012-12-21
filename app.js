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
LocalStrategy = require('passport-local').Strategy;

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

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

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

var messages = [];
io.on('connection', function (socket) {
    messages.forEach(function(m) {
       socket.emit("new-message", m);
    });
    socket.on('new-message', function (data) {
        var message = {
            date: new Date(),
            message: sanitize(data.message).xss(),
            user: socket.handshake.user.username
        };
        messages.push(message);

        io.sockets.emit('new-message', message);
    });
});

server.listen(process.env.PORT || 3000)

console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env)

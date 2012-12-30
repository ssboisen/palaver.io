var LocalStrategy = require('passport-local').Strategy;
var passportSocketIo = require('passport.socketio');

module.exports = setupPassport;

function setupPassport(passport, chatRepo, io, sessionInfo){

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
            sessionKey:    sessionInfo.sessionKey,      //the cookie where express (or connect) stores its session id.
            sessionStore:  sessionInfo.sessionStore,     //the session store that express uses
            sessionSecret: sessionInfo.sessionSecret, //the session secret to parse the cookie
            fail: function(data, accept) {     // *optional* callbacks on success or fail
                accept(null, false);             // second param takes boolean on whether or not to allow handshake
            },
            success: function(data, accept) {
                accept(null, true);
            }
        }));
    });

}
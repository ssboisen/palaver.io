var LocalStrategy = require('passport-local').Strategy;

module.exports = setupPassport;

function setupPassport(passport, chatRepo){

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
}
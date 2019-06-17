var LocalStrategy = require("passport-local").Strategy;

var connection=require('../models/database');
var bcrypt = require('bcrypt-nodejs');

module.exports = function(passport) {
 passport.serializeUser(function(user, done){
  done(null, user.userid);
 });

 passport.deserializeUser(function(userid, done){
  connection.query("SELECT * FROM user WHERE userid = ? ", [userid],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.use(
  'local-login',
  new LocalStrategy({
   usernameField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
   connection.query("SELECT * FROM user WHERE email = ? ", [email],
   function(err, rows){
    if(err)
    { return done(err);  }
    else if(!rows.length){
     return done(null, false, req.flash('loginMessage', ' User Not Found'));
    }
    else if(!bcrypt.compareSync(password, rows[0].password)){
     return done(null, false, req.flash('loginMessage', ' Incorrect Password'));
    }
    
    return done(null, rows[0]);
   });
  })
 );
};



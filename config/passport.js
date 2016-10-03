let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let FacebookStrategy = require('passport-facebook').Strategy
let TwitterStrategy = require('passport-twitter').Strategy
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
let secret = require('../config/auth.js')
let Users = require('../models/user.js')

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
  function(email, password, done) {
    Users.findOne({'local.email': email }, function(err, user) {
      if (err) {
        return done(err)
      }
      if (!user) {
        console.log("incorrect username")
        return done(null, false, { message: 'Incorrect username.' });
      } else {
        console.log(user);
        helper.comparePassword(password, user.local.password, function(err, isMatch) {
          if (isMatch) {
            console.log('betul username and password')
            return done(null, user)
          } else {
            console.log('salah password')
            return done(null, false, { message: 'Invalid password' })
          }
        })
      }
    });
}));

passport.use(new TwitterStrategy({
  consumerKey: secret.twitter.consumerKey,
  consumerSecret: secret.twitter.consumerSecret,
  callbackURL: secret.twitter.callbackURL,
},
function(token, tokenSecret, profile,done){
  Users.findOne({'twitter.id': profile.id}, function(err, user){
    if(err){
      console.log(err)
    }

    if(user){
      return done(null, user)
    } else {
      user = new Users({"twitter.id":profile.id, "twitter.token": token, "twitter.username": profile.username, "twitter.displayName": profile.displayName}).save(function(err){
        if(err){
          console.log(err)
        }
        Users.findOne({'twitter.id': profile.id}, function(err, user){
          if(err){
            console.log(error)
          }
          if(user){
            return done(null, user)
          }
        })
      })
    }
  })
}
))

passport.use(new FacebookStrategy({
  clientID: secret.facebookauth.clientId,
  clientSecret: secret.facebookauth.clientSecret,
  callbackURL: secret.facebookauth.callbackURL,
  "profileFields": ["id", "birthday", "email", "first_name", "gender", "last_name"]
},
  function(token, refreshToken, profile, done){
    Users.findOne({"facebook.id": profile.id}, function(err, user){
      if(err){
        console.log(error)
      }

      if(user){
        return done(null, user)
      } else {
        console.log(profile)
        user = new Users({"facebook.id": profile.id, "facebook.token": token, "facebook.name": profile.name.givenName +' '+ profile.name.lastName, "facebook.email": profile.emails[0].value}).save(function(err){
          if(err){
            console.log(err)
          }
          console.log("test", user)
          Users.findOne({"facebook.id": profile.id}, function(err, user){
            if(err){
              console.log(error)
            }
            if(user){
              return done(null,user)
            }
          })
        })
      }
    })
  }
))

passport.use(new GoogleStrategy({
  clientID: secret.google.clientID,
  clientSecret: secret.google.clientSecret,
  callbackURL: secret.google.callbackURL,
},
function(token, tokenSecret, profile, done){
  Users.findOne({"google.id": profile.id}, function(err,user){
    if(err){
      console.log(err)
    }

    if(user){
      return done(null, user)
    } else {
      user = new Users({"google.id": profile.id, "google.token": token, "google.name": profile.displayName, "google.email": profile.emails[0].value}).save(function(err){
        if(err){
          console.log(err)
        }
        console.log(user)
        Users.findOne({"google.id": profile.id}, function(err,user){
          if(err){
            console.log(err)
          }

          if(user){
            return done(null, user)
          }
        })
      })
    }
  })
}
))

module.exports = passport

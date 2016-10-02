let express = require('express')
let router = express.Router()
let mongoose = require('mongoose')
let helper = require('../helper/function.js')
let Users = require('../models/user.js')
let passport = require('passport')
let bodyParser = require('body-parser')
let secret = require('../config/auth.js')
let expressValidator = require('express-validator')
let LocalStrategy = require('passport-local').Strategy
let FacebookStrategy = require('passport-facebook').Strategy
let TwitterStrategy = require('passport-twitter').Strategy
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

router.use(bodyParser.urlencoded({ extended: true }))
router.use(expressValidator())

router.use(passport.initialize());
router.use(passport.session());

router.get('/', function(req, res) {
  mongoose.model('users').find(function(err, result) {
    res.send(result)
  })
})

router.get('/register', function(req, res) {
  res.render('register.ejs', {message: null})
})

router.post('/register', function(req, res) {
  let errors = helper.checkRegistrationField(req)

  if(errors){
    let error_message = []
    for (let i in errors){
      error_message.push(errors[i].msg)
    }
    res.render('register.ejs', {message: error_message})
  } else {
    Users.findOne({"local.email": req.body.email}, function(err,user){
      if(err){
        console.log(err)
      }

      if(user){
        res.redirect('/register')
      } else {
        helper.hashPassword(req.body.password, function(hash){
          let newuser = new Users({"local.email": req.body.email, "local.password": hash});
          newuser.save(function(err,result) {
            if (err) {
              console.log(err)
            } else {
              console.log(result)
              res.redirect('/login')
            }
          })
        })
      }
    })
  }
})

router.get('/login', function(req, res) {
  res.render('login.ejs')
})

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
        return done(null, user)
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
          return done(null, user)
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
        return done(null, user)
      })
    }
  })
}
))



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login' }), function(req, res, next) {
  res.redirect('/')
});

router.post('/facebooklogin', passport.authenticate('facebook', {scope: ['email']}))

router.get('/facebooklogin/callback', passport.authenticate('facebook', { successRedirect: '/dashboard', failureRedirect: '/login' }));

router.post('/twitterlogin', passport.authenticate('twitter'))

router.get('/twitterlogin/callback', passport.authenticate('twitter', { successRedirect: '/dashboard', failureRedirect: '/login' }));

router.post('/googlelogin', passport.authenticate('google', { scope : ['profile', 'email'] }))

router.get('/googlelogin/callback', passport.authenticate('google', { successRedirect: '/dashboard', failureRedirect: '/login' }));

router.get('/dashboard', function(req,res){
  if(req.user){
    let identity = req.user.facebook.email || req.user.local.email || req.user.google.email || req.user.twitter.displayName
    res.render('dashboard.ejs', {user: identity})
  } else {
    res.redirect('/login')
  }
})

router.post('/logout', function(req,res){
  req.logout()
  res.redirect('/login')
})

module.exports = router



//for third party, why failed to serialize user only after the first time logging in??
//how to redirect while sending message?

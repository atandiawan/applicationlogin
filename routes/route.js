let express = require('express')
let router = express.Router()
let mongoose = require('mongoose')
let helper = require('../helper/function.js')
let Users = require('../models/user.js')
let bodyParser = require('body-parser')
let secret = require('../config/auth.js')
let expressValidator = require('express-validator')
let passport = require('../config/passport.js')


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

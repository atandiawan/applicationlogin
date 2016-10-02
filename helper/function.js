let bcrypt = require('bcryptjs')
let Users = require('../models/user.js')
let express = require('express')
let bodyParser = require('body-parser')
let expressValidator = require('express-validator')
let router = express.Router()

let hashPassword = function(password, callback){
  bcrypt.genSalt(10, function(err,salt){
    bcrypt.hash(password, salt, function(err, hash){
      callback(hash)
    })
  })
}

let comparePassword = function(password, correctpassword, callback){
  bcrypt.compare(password, correctpassword, function(err, isMatch){
    if(err){
      console.log(err)
    } else {
      callback(null, isMatch)
    }
  })
}

let checkRegistrationField = function(req){
  req.checkBody("email", "Email cannot be blank").notEmpty()
  req.checkBody("password", "Password cannot be blank").notEmpty()
  let errors = req.validationErrors()
  return errors
}

module.exports = {hashPassword, comparePassword, checkRegistrationField}

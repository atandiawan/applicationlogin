let mongoose = require('mongoose')
mongoose.connect('localhost:27017/yuktest')

let userSchema = new mongoose.Schema({
  local:{
    email: String,
    password: String
  },
  facebook:{
    id: String,
    token: String,
    email: String,
    name: String
  },
  twitter:{
    id: String,
    token: String,
    username: String,
    displayName: String
  },
  google:{
    id: String,
    token:String,
    name: String,
    email: String
  }
})

let Users = mongoose.model('users', userSchema)

module.exports = Users

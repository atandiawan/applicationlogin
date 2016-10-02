let secret = {
  facebookauth:{
    clientId: "1380448251995165",
    clientSecret: "9d3c6b3aff0b48c5cea4459902acbd99",
    callbackURL: "http://localhost:3000/facebooklogin/callback"
  },
  twitter:{
    consumerKey:"nnokV2lzBmdm8IaKTnB9wpZex",
    consumerSecret: "war9jmdR2cqdIXD3UiqIgoDs8PUj06cOMINKBIHr1ZEzYeLzqU",
    callbackURL: "http://localhost:3000/twitterlogin/callback"
  },
  google:{
    clientID: "479964753573-30q4k6ttlefjc0fbgdd9d8rf3dln5n8j.apps.googleusercontent.com",
    clientSecret: "nNGkGAcDs3aT8hLnncoLcWkf",
    callbackURL: "http://localhost:3000/googlelogin/callback"
  }
}

module.exports = secret

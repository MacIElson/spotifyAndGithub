var mongoose = require('mongoose');

// Create a Schema
var userSchema = mongoose.Schema({
    spotify         : {
        id           : String,
        accessToken  : String,
        accessTokenExpiresTime: Date,
        refreshToken : String

    },
    github : {
    	login	 : String,
        id       : String,
    	accessToken  : String
    }
});

module.exports = mongoose.model("User", userSchema);
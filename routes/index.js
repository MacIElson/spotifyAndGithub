// This is where I define the behavior for routes
var express = require('express');
var passport = require('passport');
var async = require('async');
var path = require('path');
var Article = require('../models/articleModel.js');
var router = express.Router();
var authKeys = require('../authKeys.js');
var spotifyHelper = require('../helpers/spotifyHelper.js');
var SpotifyWebApi = require('spotify-web-api-node');

module.exports = router;

var homeGET = function(req, res) {
    //console.log(req.spotifyObj)
	res.sendFile(path.resolve('public/html/main.html'));
}

var updateTokenTestGET = function(req, res) {
    console.log("user in updateTokenTestGET")
    console.log(req.user[0])
    spotifyHelper.getNewAccessTokenIfExpired(req.user[0], function (err, user) {
        console.log(user)
        res.send(user);
    })
}

var getPlaylistsGET = function(req, res) {

    var spotifyApi = new SpotifyWebApi({
      clientId : authKeys.SPOTIFY_CLIENT_ID,
      clientSecret : authKeys.SPOTIFY_CLIENT_SECRET,
      redirectUri : authKeys.SPOTIFY_CALLBACK_URL
    });
    spotifyApi.setAccessToken();
}


module.exports.home = homeGET;
module.exports.updateTokenTest = updateTokenTestGET;
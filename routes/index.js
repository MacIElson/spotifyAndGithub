// This is where I define the behavior for routes
var express = require('express');
var passport = require('passport');
var async = require('async');
var path = require('path');
var User = require('../models/userModel.js');
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

var getCurrentUserGET = function(req, res) {
    var spotifyApi = new SpotifyWebApi({
      clientId : authKeys.SPOTIFY_CLIENT_ID,
      clientSecret : authKeys.SPOTIFY_CLIENT_SECRET,
      redirectUri : authKeys.SPOTIFY_CALLBACK_URL
    });
    spotifyApi.setAccessToken(req.user[0].spotify.accessToken)
    spotifyApi.setRefreshToken(req.user[0].spotify.refreshToken)

    spotifyHelper.getNewAccessTokenIfExpired(spotifyApi, req.user[0], function (err, user) {
        spotifyHelper.getCurrentUser(spotifyApi)
        res.send(user);
    })
}

var getCurrentUserPlaylistsGET = function(req, res) {
    var spotifyApi = new SpotifyWebApi({
      clientId : authKeys.SPOTIFY_CLIENT_ID,
      clientSecret : authKeys.SPOTIFY_CLIENT_SECRET,
      redirectUri : authKeys.SPOTIFY_CALLBACK_URL
    });
    spotifyApi.setAccessToken(req.user[0].spotify.accessToken)
    spotifyApi.setRefreshToken(req.user[0].spotify.refreshToken)

    spotifyHelper.getNewAccessTokenIfExpired(spotifyApi, req.user[0], function (err, user) {
        spotifyHelper.getUserPlaylists(spotifyApi,req.user[0].spotify.id, function (err, data) {
            if (err) {return console.log(err)}
            console.log(data.body)
        })
        res.send(user);
    })
}


module.exports.home = homeGET;
module.exports.updateTokenTest = updateTokenTestGET;
module.exports.getCurrentUser = getCurrentUserGET;
module.exports.getCurrentUserPlaylists = getCurrentUserPlaylistsGET;
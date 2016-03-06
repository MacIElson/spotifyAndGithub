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

var routeLoggedIn = function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else if (typeof req.user[0].github.id === "undefined") {
        res.redirect('/loginGithub');
    } else {
        res.redirect('/home');
    }
}

var attachSpotifyApiPASSTHROUGH = function(req, res, next) {

    var spotifyApi = new SpotifyWebApi({
      clientId : authKeys.SPOTIFY_CLIENT_ID,
      clientSecret : authKeys.SPOTIFY_CLIENT_SECRET,
      redirectUri : authKeys.SPOTIFY_CALLBACK_URL
    });
    spotifyApi.setAccessToken(req.user[0].spotify.accessToken)
    spotifyApi.setRefreshToken(req.user[0].spotify.refreshToken)

    spotifyHelper.getNewAccessTokenIfExpired(spotifyApi, req.user[0], function (err, spotifyApi, user) {
        req.user = user;
        req.spotifyApi = spotifyApi;
        next();
    })

}

var homeGET = function(req, res) {
    //console.log(req.spotifyApi)
	res.sendFile(path.resolve('public/html/main.html'));
}

var getCurrentUserGET = function(req, res) {
    spotifyHelper.getCurrentUser(req.spotifyApi, function(err, data) {
        res.send(data.body);
    })
}

var getCurrentUserPlaylistsGET = function(req, res) {
        spotifyHelper.getUserPlaylists(req.spotifyApi,req.user.spotify.id, function (err, data) {
            if (err) {return console.log(err)}
            res.send(data.body);
        })
}

module.exports.attachSpotifyApi = attachSpotifyApiPASSTHROUGH;
module.exports.home = homeGET;
module.exports.getCurrentUser = getCurrentUserGET;
module.exports.getCurrentUserPlaylists = getCurrentUserPlaylistsGET;
module.exports.routeLoggedIn = routeLoggedIn;
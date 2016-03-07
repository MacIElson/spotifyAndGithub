// This is where I define the behavior for routes
var express = require('express');
var passport = require('passport');
var async = require('async');
var path = require('path');
var User = require('../models/userModel.js');
var router = express.Router();
var authKeys = require('../authKeys.js');
var spotifyHelper = require('../helpers/spotifyHelper.js');
var githubHelper = require('../helpers/githubHelper.js');
var SpotifyWebApi = require('spotify-web-api-node');
var GithubApi = require('github-api');
var request = require('request');
var fs = require('fs');

module.exports = router;

var routeLoggedIn = function (req, res) {
    console.log(req.user)
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else if (typeof req.user[0].github.id === "undefined") {
        res.redirect('/loginGithub');
    } else {
        res.redirect('/home');
    }
}

var stripUserArray = function(req,res, next) {
    req.user = req.user[0];
    next();
}

var attachGithubApiPASSTHROUGH = function(req, res, next) {
    var githubApi = new GithubApi({
        token: req.user.github.accessToken,
        auth: "oauth"
    });
    req.githubApi = githubApi;
    next();

}

var attachSpotifyApiPASSTHROUGH = function(req, res, next) {

    var spotifyApi = new SpotifyWebApi({
      clientId : authKeys.SPOTIFY_CLIENT_ID,
      clientSecret : authKeys.SPOTIFY_CLIENT_SECRET,
      redirectUri : authKeys.SPOTIFY_CALLBACK_URL
    });
    spotifyApi.setAccessToken(req.user.spotify.accessToken)
    spotifyApi.setRefreshToken(req.user.spotify.refreshToken)
    spotifyHelper.getNewAccessTokenIfExpired(spotifyApi, req.user, function (err, spotifyApi, user) {
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
        console.log(err)
        console.log(data)
        res.send(data.body);
    })
}

var getCurrentUserPlaylistsGET = function(req, res) {
        spotifyHelper.getUserPlaylists(req.spotifyApi,req.user.spotify.id, function (err, playlists) {
            if (err) {return console.log(err)}
            res.send(playlists);
        })
}

var getPlaylistTracksGET = function(req, res) {
        console.log('getPlaylistTracksGET')
        spotifyHelper.getPlaylistTracks(req.spotifyApi,req.user.spotify.id, '5ayVO4Y7RwpdHbrVl0Lkzm',function (err, tracks) {
            if (err) {return console.log(err)}
            res.send(tracks);
        })
}

var backupPlaylistPOST = function(req, res) {
    console.log(req.body)
    spotifyHelper.getPlaylistTracks(req.spotifyApi, req.body.user, req.body.id, function(err, tracks){
        console.log(tracks)
        githubHelper.createUpdateFile(req.githubApi, "spotifyHistory", req.body.id, JSON.stringify(tracks, null, 4), "backup!", function(err) {
            if (err) {
                console.log(err)
                res.send(err)
            } else {
                console.log('successfully updated file')
                res.send(null)
            }

        })
    })
}


//testing github helper getFileSHAs
var getFileSHAsGET = function(req, res) {
    filename = '503HzKH74uYiK6TJmU868m';
    githubHelper.getFileSHAs(req.githubApi, "spotifyHistory", filename, function(err, repodata) {
        if(err) { console.log(err); }
        else { res.send(repodata); }
    })


}

//testing github helper getCommitContent
var getCommitContentGET = function(req, res) {
    sha = 'b469c2385de18eb52174dfdf9dafd5be2b6c825c';
    filename = '503HzKH74uYiK6TJmU868m';
    githubHelper.getCommitContent(req.githubApi, "spotifyHistory", filename, sha, function(err, data) {
        if(err) { console.log(err); }
        else { res.send(data); }
    })

    
}

module.exports.routeLoggedIn = routeLoggedIn;
module.exports.stripUserArray = stripUserArray;
module.exports.attachSpotifyApi = attachSpotifyApiPASSTHROUGH;
module.exports.attachGithubApi = attachGithubApiPASSTHROUGH;
module.exports.home = homeGET;
module.exports.getCurrentUser = getCurrentUserGET;
module.exports.getCurrentUserPlaylists = getCurrentUserPlaylistsGET;
module.exports.getPlaylistTracks = getPlaylistTracksGET;
module.exports.backupPlaylist = backupPlaylistPOST;
module.exports.getCommitContent = getCommitContentGET;
module.exports.getFileSHAs = getFileSHAsGET;

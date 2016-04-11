// This is where I define the behavior for routes
var express = require('express');
var passport = require('passport');
var async = require('async');
var path = require('path');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');
var GithubApi = require('github-api');
var request = require('request');
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require("http");
var url = require("url");

var User = require('../models/userModel.js');
var spotifyHelper = require('../helpers/spotifyHelper.js');
var githubHelper = require('../helpers/githubHelper.js');

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
      clientId : process.env.SPOTIFY_CLIENT_ID,
      clientSecret : process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri : process.env.SPOTIFY_CALLBACK_URL
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
    // Remove log statements from master
    console.log("backupPlaylistPOST")
    spotifyHelper.getPlaylistTracks(req.spotifyApi, req.body.user, req.body.id, function(err, tracks){
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

var restorePlaylistPOST = function(req, res) {
    "expects {name: 'playlistName', id: 'playlistId', sha: 'shaToRestoreTo'}"
    console.log("restorePlaylistPOST")

    githubHelper.getCommitContent(req.githubApi, "spotifyHistory", req.body.id, req.body.sha, function(err, data) {
        if(err) { console.log(err); }
        else { 
            console.log('tracks to restore')
            console.log(data)
            spotifyHelper.createPlaylist(req.spotifyApi, req.user.spotify.id, req.body.name + " - " + req.body.date, function(err,data1){
                console.log(data1)
                console.log('trying to call insertPlaylistTracks')
                spotifyHelper.insertPlaylistTracks(req.spotifyApi,req.user.spotify.id, data1.body.id, data, function(err, data){
                    console.log(data)
                    res.send(data);
                })
                
            })
        }
    })

    "get the tracks from that commit"

}

var createPlaylist = function(req, res) {
    "expects {name: 'playlistName', id: 'plailistId', commit: 'commitToRestoreTo'}"
    console.log("createPlaylistPOST")

    "get the tracks from that commit"
    spotifyHelper.createPlaylist(req.spotifyApi, 'moch7', 'testing2', function(err,data){
        console.log(data.body.id)
        res.send(data)
    })
}



var getFileSHAsGET = function(req, res) {
    //filename = '503HzKH74uYiK6TJmU868m';

    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    filename = queryAsObject.playlist_id;

    console.log(queryAsObject);


    console.log('getFileSHAsGET filename ' + filename)
    githubHelper.getFileSHAs(req.githubApi, "spotifyHistory", filename, function(err, repodata) {
        if(err) { console.log(err); }
        else { res.send(repodata); }
    })


}

//testing github helper getCommitContent. test at /commit
var getCommitContentGET = function(req, res) {
    sha = 'b469c2385de18eb52174dfdf9dafd5be2b6c825c';
    filename = '503HzKH74uYiK6TJmU868m';
    githubHelper.getCommitContent(req.githubApi, "spotifyHistory", filename, sha, function(err, data) {
        if(err) { console.log(err); }
        else { res.send(data); }
    })

    
}

// In order to avoid this series of exports you can simple initiate
// a dictonary i.e. routes = {} and have all functions be part of that 
// object, as follows:

// routes.routeLoggedIn = function(req, res){...} etc.

// And in the end of your file, simply do:

// module.exports=routes

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
module.exports.createPlaylist = createPlaylist;
module.exports.restorePlaylist = restorePlaylistPOST;

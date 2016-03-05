var authKeys = require('../authKeys.js');
var SpotifyWebApi = require('spotify-web-api-node');

//user is a user object and done it the callback function
var getNewAccessTokenIfExpired = function(spotifyApiInstance, user, done) {
	console.log("user in getNewAccessTokenIfExpired")
	console.log(user)
	if ((user.spotify.accessTokenExpiresTime - Date.now()) < 10000 ) {
	    spotifyApiInstance.refreshAccessToken()
			.then(function(data) {
			    console.log('The access token has been refreshed!');
			    console.log(data.body)
			    user.spotify.accessToken = data.access_token
			    d = new Date();
	            d.setSeconds(d.getSeconds() + data.body.expires_in);
	            user.spotify.accessTokenExpiresTime = d;
	            user.save(function(err) {
	                if (err)
	                    throw err;

	                        // if successful, return the user
	                return done(null, user);
	            });

			}, function(err) {
			    console.log('Could not refresh access token', err);
		});
	} else {
		return done(null, user);
	}
}

var getCurrentUser = function(spotifyApiInstance, callback) {
	spotifyApiInstance.getMe()
	.then(function(data) {
		console.log('Some information about the authenticated user', data.body);
	}, function(err) {
		console.log('Something went wrong!', err);
	});
}

var getUserPlaylists = function(spotifyApiInstance, username, callback) {
	spotifyApiInstance.getUserPlaylists(username,{limit: 50}, callback)
}

var createPlaylists = function(spotifyApiInstance, username, callback) {
	spotifyApiInstance.createPlaylist('moch7', 'My Cool Playlist', { 'public' : false })
	.then(function(data) {
		console.log('Created playlist!');
	}, function(err) {
		console.log('Something went wrong!', err);
	});
}



module.exports.getNewAccessTokenIfExpired = getNewAccessTokenIfExpired;
module.exports.getUserPlaylists = getUserPlaylists;
module.exports.getCurrentUser = getCurrentUser;
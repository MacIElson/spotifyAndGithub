var authKeys = require('../authKeys.js');
var SpotifyWebApi = require('spotify-web-api-node');

//user is a user object and done it the callback function
var getNewAccessTokenIfExpired = function(spotifyApiInstance, user, callback) {
	console.log("user in getNewAccessTokenIfExpired")
	console.log(user)
	if ((user.spotify.accessTokenExpiresTime - Date.now()) < 60000 ) {
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
	                return callback(null, spotifyApiInstance, user);
	            });

			}, function(err) {
			    console.log('Could not refresh access token', err);
		});
	} else {
		return callback(null, spotifyApiInstance, user);
	}
}

var getCurrentUser = function(spotifyApiInstance, callback) {
	spotifyApiInstance.getMe(callback)
}

var getUserPlaylists = function(spotifyApiInstance, username, callback) {
	spotifyApiInstance.getUserPlaylists(username,{limit: 50}, callback)
}

var getPlaylistTracks = function(spotifyApiInstance, username, playlistId, callback) {
	spotifyApi.getPlaylist(username, playlistId, callback)
}

var createPlaylist = function(spotifyApiInstance, username, title, callback) {
	spotifyApiInstance.createPlaylist(username, title, { 'public' : false },callback)
}


module.exports.getNewAccessTokenIfExpired = getNewAccessTokenIfExpired;
module.exports.getUserPlaylists = getUserPlaylists;
module.exports.getPlaylistTracks = getPlaylistTracks;
module.exports.getCurrentUser = getCurrentUser;
module.exports.createPlaylist = createPlaylist;
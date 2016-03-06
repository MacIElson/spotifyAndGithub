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
			    console.log(spotifyApiInstance.getAccessToken())
			    //spotifyApiInstance.setAccessToken(data.access_token)
			    user.spotify.accessToken = data.body.access_token
			    d = new Date();
	            d.setSeconds(d.getSeconds() + data.body.expires_in);
	            user.spotify.accessTokenExpiresTime = d;
	            user.save(function(err) {
	                if (err)
	                    throw err;
	                console.log('updatedUser')
	                console.log(user)
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
	spotifyApiInstance.getUserPlaylists(username,{limit: 50}, function (err, data) {
		callback(err, data.body.items)
	})
}

var getPlaylistTracks = function(spotifyApiInstance, username, playlistId, callback) {
	console.log('getPlaylistTracks')
	spotifyApiInstance.getPlaylist(username, playlistId, {},function (err, data) {
		if (err) {
			console.log("get tracks error")
			console.log(err)
			return callback(err, null)
		}
		console.log('getPlaylistCallback')
		callback(err, data.body)
	})
}

var createPlaylist = function(spotifyApiInstance, username, title, callback) {

	spotifyApiInstance.createPlaylist(username, title, { 'public' : false },callback)
}


module.exports.getNewAccessTokenIfExpired = getNewAccessTokenIfExpired;
module.exports.getUserPlaylists = getUserPlaylists;
module.exports.getPlaylistTracks = getPlaylistTracks;
module.exports.getCurrentUser = getCurrentUser;
module.exports.createPlaylist = createPlaylist;
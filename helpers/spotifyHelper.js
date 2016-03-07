var authKeys = require('../authKeys.js');
var SpotifyWebApi = require('spotify-web-api-node');
var request = require('request');

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
	console.log('getPlaylistTracks2')
	url = 'https://api.spotify.com/v1/users/'+username+'/playlists/'+playlistId+'/tracks'
	token = spotifyApiInstance.getAccessToken()
	request({url:url, qs: {limit:100,fields: 'items(track(name,id,is_local,album(name)))'}}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(JSON.parse(body).items) // Show the HTML for the Google homepage.
	    callback(null,JSON.parse(body));
	  }
	  callback(error,null);
	}).auth(null, null, true, token);

}

var createPlaylist = function(spotifyApiInstance, username, title, callback) {

	spotifyApiInstance.createPlaylist(username, title, { 'public' : false },callback)
}


module.exports.getNewAccessTokenIfExpired = getNewAccessTokenIfExpired;
module.exports.getUserPlaylists = getUserPlaylists;
module.exports.getPlaylistTracks = getPlaylistTracks;
module.exports.getCurrentUser = getCurrentUser;
module.exports.createPlaylist = createPlaylist;
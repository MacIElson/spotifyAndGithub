var authKeys = require('../authKeys.js');
var SpotifyWebApi = require('spotify-web-api-node');
var request = require('request');

//user is a user object and done it the callback function
var getNewAccessTokenIfExpired = function(spotifyApiInstance, user, callback) {
	console.log("user in getNewAccessTokenIfExpired")
	if ((user.spotify.accessTokenExpiresTime - Date.now()) < 60000 ) {
	    spotifyApiInstance.refreshAccessToken()
			.then(function(data) {
			    console.log('The access token has been refreshed!');
			    //spotifyApiInstance.setAccessToken(data.access_token)
			    user.spotify.accessToken = data.body.access_token
			    d = new Date();
	            d.setSeconds(d.getSeconds() + data.body.expires_in);
	            user.spotify.accessTokenExpiresTime = d;
	            user.save(function(err) {
	                if (err)
	                    throw err;
	                console.log('updatedUser')
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
	url = 'https://api.spotify.com/v1/users/'+username+'/playlists/'+playlistId
	token = spotifyApiInstance.getAccessToken()
	request({url:url, qs: {fields: 'name,id,tracks(items(track(name,id,is_local,album(name))),next)'}}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(JSON.parse(body)) // Show the HTML for the Google homepage.
	    callback(null,JSON.parse(body));
	  } else {
	  	callback(error,null);
	  }
	  
	}).auth(null, null, true, token);

}

var insertPlaylistTracks = function(spotifyApiInstance,username, playlistId, tracks, callback) {
	console.log('insertPlaylistTracks called')
	console.log(tracks)
	var tracks = tracks.map(function(trackId){

		var base = 'spotify:track:'; 
		console.log(base.concat(trackId))
		return base.concat(trackId)
	});
	console.log(tracks)

	var len = 100;
	var trackChunks = [];
	var i = 0;
	var n = tracks.length;

	while (i < n) {
		trackChunks.push(tracks.slice(i, i += len));
		console.log(i)
	}

	console.log('trackChunks')
	console.log(trackChunks)
	insertPlaylistTracksHelper(spotifyApiInstance,username, playlistId, trackChunks, callback);

}

var insertPlaylistTracksHelper = function(spotifyApiInstance,username, playlistId, trackChunks, callback) {
	chunk = trackChunks.shift();
	console.log('chunk')
	console.log(chunk)
	console.log('playlistId')
	console.log(playlistId)
	console.log('username')
	console.log(username)
	spotifyApiInstance.addTracksToPlaylist(username, playlistId, chunk,{}, function(err, data) {
		console.log("addTracksToPlaylist callback")
		console.log(data)
		if (err) {
			console.log('err in insertPlaylistTracksHelper')
			console.log(err)
			callback(err, null)
		} else {
			console.log(trackChunks.length)
			if (trackChunks.length === 0) {
				callback(null, data)
			} else {
				insertPlaylistTracksHelper(spotifyApiInstance, username, playlistId, trackChunks, callback);
			}
		}
	})
}

var createPlaylist = function(spotifyApiInstance, username, title, callback) {
	spotifyApiInstance.createPlaylist(username, title, { 'public' : false }, callback)
}


module.exports.getNewAccessTokenIfExpired = getNewAccessTokenIfExpired;
module.exports.getUserPlaylists = getUserPlaylists;
module.exports.getPlaylistTracks = getPlaylistTracks;
module.exports.insertPlaylistTracks = insertPlaylistTracks;
module.exports.getCurrentUser = getCurrentUser;
module.exports.createPlaylist = createPlaylist;
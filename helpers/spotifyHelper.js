var authKeys = require('../authKeys.js');
var SpotifyWebApi = require('spotify-web-api-node');

//user is a user object and done it the callback function
var getNewAccessTokenIfExpired = function(user, done) {
	console.log("user in getNewAccessTokenIfExpired")
	console.log(user)
	if ((user.spotify.accessTokenExpiresTime - Date.now()) < 10000 ) {
		var spotifyApi = new SpotifyWebApi({
	      clientId : authKeys.SPOTIFY_CLIENT_ID,
	      clientSecret : authKeys.SPOTIFY_CLIENT_SECRET,
	      redirectUri : authKeys.SPOTIFY_CALLBACK_URL
	    });
	    spotifyApi.setRefreshToken(user.spotify.refreshToken);
	    spotifyApi.refreshAccessToken()
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

module.exports.getNewAccessTokenIfExpired = getNewAccessTokenIfExpired;
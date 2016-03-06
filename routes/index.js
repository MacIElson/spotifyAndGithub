// This is where I define the behavior for routes

//I found this Spotify 

var express = require('express');
var async = require('async');
var path = require('path');
var Article = require('../models/articleModel.js');
var authkeys = require('../authKeys.js');
var querystring = require('querystring');
var request = require('request');

var Github = require('github-api');

var router = express.Router();
var authroutes = {};


//TODO: DON'T use math.random!!!
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
}

var stateKey = 'github_auth_state';
var apiKey = 'github_auth_api';

authroutes.getHome = function(req, res) {
	res.sendFile(path.resolve('public/html/main.html'));
};

authroutes.getGithubAuth = function(req, res) {


  var state = generateRandomString(16);
  console.log('State: ' + state);
  res.cookie(stateKey, state);

  // your application requests authorization
  console.log(authkeys.GITHUB_CLIENT_ID);
  var scope = 'user repo';
  res.redirect('https://github.com/login/oauth/authorize?' +
    querystring.stringify({
      client_id: authkeys.GITHUB_CLIENT_ID,
      scope: scope,
      redirect_uri: authkeys.GITHUB_CALLBACK_URL,
      state: state
    }));
};

authroutes.getGithubCallback = function(req, res) {
  var code = req.query.code || null;
  console.log('Code: ' + code);
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  //oh noes! states don't match! don't log in.
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    console.log('In the callback!');
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://github.com/login/oauth/access_token',
      form: {
        code: code,
        client_id: authkeys.GITHUB_CLIENT_ID,
        client_secret: authkeys.GITHUB_CLIENT_SECRET,
        // redirect_uri: 'http://localhost:3000/auth/github/callback/token',
        state: state
      },
      json: true
    };
  }

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

      var access_token = body.access_token;  

    console.log('Access token: ' + access_token);

    //WHY NO WORK???
    var githubapi = new Github({
      token: access_token,
      auth: "oauth"
    });

    var user = githubapi.getUser();
    user.show(null, function(err, user) {
      if(err) {console.log(err)}
      console.log(user)
    })
    

    //Manual redirecting works...
    // res.redirect('https://api.github.com/user?' +
    //   querystring.stringify({
    //     access_token: access_token,
    // }));

    //What about this? So we can make a request...
  //   options = {
  //     url: 'https://api.github.com/user',
  //     headers: { 'User-Agent': 'skumarasena' },
  //     access_token: access_token,
  //   }

  //   request.get(options, function(req, res, body) {
  //     console.log(body)
  //     console.log(res)
  //   })
  // }

    res.redirect('/#' +
      querystring.stringify({
        access_token: access_token,
      }));


  } else {
    console.log('Authentication error!');
    res.redirect('/#' +
      querystring.stringify({
        error: 'invalid_token'
      }));
  }

    
  });


}

module.exports = authroutes;
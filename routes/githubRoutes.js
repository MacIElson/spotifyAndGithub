// This is where I define the behavior for routes
var express = require('express');
var passport = require('passport');
var async = require('async');
var path = require('path');
var User = require('../models/userModel.js');
var router = express.Router();
var authKeys = require('../authKeys.js');

var homeGET = function(req, res) {
    //console.log(req.spotifyObj)
	res.sendFile(path.resolve('public/html/main.html'));
}

module.exports.home = homeGET;
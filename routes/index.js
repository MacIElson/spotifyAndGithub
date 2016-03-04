// This is where I define the behavior for routes

var express = require('express');
var async = require('async');
var path = require('path');
var Article = require('../models/articleModel.js');
var router = express.Router();

module.exports = router;

var homeGET = function(req, res) {
	res.sendFile(path.resolve('public/html/main.html'));
}

module.exports.home = homeGET;
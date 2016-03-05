var Github = require('github-api');

// var gitauth = require('./authKeys.js');

var github = new Github({
    token: "OAUTH_TOKEN",
    auth: "oauth"
});

module.exports = github;
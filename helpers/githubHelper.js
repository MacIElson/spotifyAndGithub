var authKeys = require('../authKeys.js');
var githubapi = require('github-api');

//create new repo
var createNewRepo = function(githubApiInstance, repoName, callback) {
    var user = githubApiInstance.getUser();
    user.show(null, function(err, userfields) {
        //if repo already exists, will not create. WIll error instead...?
        user.createRepo({"name": repoName}, function(err, res) {
            if(err) { console.log(err); } 

            if (callback && typeof(callback) === "function") {
                callback(err, res);
            }
        });

    });
}
//create a new file in that repo
var createUpdateFile = function(githubApiInstance, repoName, playlistname, newcontent, message, callback) {
    // var options = {
    //   author: {name: 'Author Name', email: 'author@example.com'},
    //   committer: {name: 'Committer Name', email: 'committer@example.com'},
    //   encode: true // Whether to base64 encode the file. (default: true) 
    // }
    // repo.write('master', 'path/to/file', 'YOUR_NEW_CONTENTS', 'YOUR_COMMIT_MESSAGE', options, function(err) {});
    // }

    console.log('Create-update function called!');
    var user = githubApiInstance.getUser();
    user.show(null, function(err, userfields) {

        username = userfields.login;
        console.log('User login: ' + username);
        
        repo = githubApiInstance.getRepo(username, repoName);
        repo.write('master', playlistname, newcontent, message, function(err) {
            if(err) { console.log(err); }
            else { console.log('Success with write!'); }

            if(callback && typeof(callback) === "function") {
                callback(err)
            }
        });

    });

}


module.exports.createNewRepo = createNewRepo;
module.exports.createUpdateFile = createUpdateFile;
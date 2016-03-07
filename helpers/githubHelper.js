var authKeys = require('../authKeys.js');
var githubapi = require('github-api');

//create new repo
var createNewRepo = function(githubApiInstance, repoName, callback) {
    var user = githubApiInstance.getUser();
    user.show(null, function(err, userfields) {
        //if repo already exists, will not create. WIll error instead...?
        user.createRepo({"name": repoName}, function(err, res) {
            if(err) { 
                console.log('err from CreateRepo')
                console.log(err); 
            } 

            if (callback && typeof(callback) === "function") {
                callback(err, res);
            }
        });

    });
}
//create a new file in that repo, or update the file if it exists. 
//file should have the same name as playlist
//new content replaces old content
var createUpdateFile = function(githubApiInstance, repoName, playlistname, newcontent, message, callback) {
    console.log('Create-update function called!');
    var user = githubApiInstance.getUser();
    user.show(null, function(err, userfields) {
        console.log(err)

        username = userfields.login;
        
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
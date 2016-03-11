var githubapi = require('github-api');
var request = require('request');

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
        if (err) {
            console.log('error getting user is createUpdateFile')
            console.log(err)
        }
        
        username = userfields.login;
        
        repo = githubApiInstance.getRepo(username, repoName);
        repo.write('master', playlistname, newcontent, message, function(err) {
            if(err) { 
                console.log('err is repo.write');
                console.log(err);
            }
            else { console.log('Success with write!'); }
            if(callback && typeof(callback) === "function") {
                callback(err)
            }
        });

    });

}


//given filename (ie. playlist ID), get all commit SHAs
var getFileSHAs = function(githubApiInstance, repoName, playlistname, callback) {
    var user = githubApiInstance.getUser()

    user.show(null, function(err, userfields) {
        username = userfields.login;

        //GET https://api.github.com/repos/:owner/:repo/commits?path=FILE_PATH
        var url = 'https://api.github.com/repos/' + username + '/' + repoName + '/commits?path=' + playlistname;
        var options = {
          url: url,
          headers: {            //CHANGE TO SKUMARASENA IF UNAUTHORIZED
            'User-Agent': username, 
            'Content-Type': "application/json"
          }

        };

        request(options, function(err, response, body) {
            // console.log(response)
            // var json = JSON.stringify(eval("(" + body + ")"));
            var commitlist = JSON.parse(body)


            // shas = [];
            // for (var i in commitlist) {
            //     shas.push(commitlist[i].sha)
            //     console.log(commitlist[i].sha)
            // }

            // if(callback && typeof(callback) === "function") {
            //     callback(err, shas) //body)
            // }

            commits = []
            for (var i in commitlist) {
                commit = {}

                date = commitlist[i].commit.author.date;
                sha = commitlist[i].sha;

                commit.date = date;
                commit.sha = sha;
                //commit_dates.push(date)
                commits.push(commit)
            }
            if(callback && typeof(callback) === "function") {
                callback(err, commits)
            }
        })

    })

}




//Given filename and commit SHA, get list of Spotify song IDs
//playlistname is technically playlist ID
var getCommitContent = function(githubApiInstance, repoName, playlistname, sha, callback) {
    var user = githubApiInstance.getUser()
    console.log(user)

    user.show(null, function(err, userfields) {
        username = userfields.login;
        console.log('User login: ' + username)

        //https://raw.githubusercontent.com/USERNAME/REPONAME/SHA/PATH/TO/FILE.EXT
        //https://raw.githubusercontent.com/skumarasena/spotifyHistory/b469c2385de18eb52174dfdf9dafd5be2b6c825c/503HzKH74uYiK6TJmU868m
        var link = 'https://raw.githubusercontent.com/' + username + '/' + repoName + '/' + sha + '/' + filename;
        request.get(link, function(err, response, body) {

            var content = JSON.parse(body);
            
            track_ids = [];
            if (content.hasOwnProperty('tracks')) {
                console.log(content["tracks"].items);
                tracks = content["tracks"].items;
            
 

                
                for(var i in tracks) {
                    console.log('Item ' + i + ' ' + tracks[i].track.name);
                    console.log(tracks[i].track.id);
                    track_ids.push(tracks[i].track.id);
                }
            }

            
            if(callback && typeof(callback) === "function") {
                callback(err, track_ids)
            }
        
        })

    })
}


module.exports.createNewRepo = createNewRepo;
module.exports.createUpdateFile = createUpdateFile;
module.exports.getCommitContent = getCommitContent;
module.exports.getFileSHAs = getFileSHAs;
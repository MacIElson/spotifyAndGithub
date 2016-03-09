angular.module('myApp.homeView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: '/views/homeView/home.html',
    controller: 'homeController'
  });
}])

.controller('homeController', ['$scope','$window', '$http', '$mdToast', function($scope,$window, $http, $mdToast) {
	console.log("homeController loaded");


    $scope.user = {};
    $scope.playlists = {};

    $scope.reverting = {}
    $scope.reverting.playlist = {};
    $scope.reverting.show = false;
    $scope.reverting.commits = [];

    //names of last backed-up/restored playlists
    $scope.backedUp = null;
    $scope.restored = null;

	$scope.logout = function (){
    	//$location.path( '/auth/spotify' );
    	$window.location.href = '/auth/logout';
	};



    $http.get('/getCurrentUser')
        .success(function(data) {
            $scope.user = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        })

    $http.get('/getCurrentUserPlaylists')
        .success(function(data){
            $scope.playlists = data;
            console.log(data)
        })
        .error(function(data) {
            console.log('Error: ' + data)
        })

    //creates github backup of playlist
    $scope.backupPlaylist = function(playlist) {
        console.log('Backing up playlist ' + playlist.name + '!')

        var POSTplaylist = {user: playlist.owner.id, id: playlist.id}
        $http.post('/backupPlaylist', POSTplaylist)
            .success(function(data) {
                console.log("playlist save successfull");
                console.log(data);
                $scope.backedUp = playlist.name;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }

    //shows previous version of a given playlist 
    $scope.showPrevious = function(playlist) {
        console.log('Showing previous versions of ' + playlist.id);

        $http.get('/getFileSHAs', {
            params: {playlist_id: playlist.id}
        })
            .success(function(data) {
                console.log('Shas: ' + data)
                $scope.reverting.show = true;
                $scope.reverting.playlist = playlist;
                $scope.reverting.commits = data;
            })
            .error(function(data) {
                console.log('Error: ' + data)
            })

    }

    //Once the "restore this version" button is pressed, sends request...
    //POST request has NOT been tested!
    $scope.restorePlaylist = function(playlist, commitsha, commitdate) {
        console.log('Reverting ' + playlist.name + ' ' + commitsha + ' ' + commitdate)

        var POSTdata = {name: playlist.name, sha: commitsha, date: commitdate}

        $http.post('/restorePlaylist', POSTdata)
            .success(function(data) {
                $mdToast.show($mdToast.simple()
                    .textContent('Successfully restored ' + playlist.name)
                    .hideDelay(3000)
                );
                console.log('Successfully restored ' + playlist.name);
            })
            .error(function(data) {
                console.log('Error: ' + data)
            })
    }

    console.log($scope);
}]);
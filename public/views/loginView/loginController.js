angular.module('myApp.loginView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: '/views/loginView/login.html',
    controller: 'loginController'
  });
}])

.controller('loginController', ['$scope','$window', function($scope,$window) {
	console.log("loginController loaded");

	$scope.loginSpotify = function (){
    	//$location.path( '/auth/spotify' );
    	$window.location.href = '/auth/spotify';
	};
}]);
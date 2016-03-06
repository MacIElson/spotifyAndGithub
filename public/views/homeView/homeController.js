angular.module('myApp.homeView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: '/views/homeView/home.html',
    controller: 'homeController'
  });
}])

.controller('homeController', ['$scope','$window', function($scope,$window) {
	console.log("homeController loaded");

	$scope.logout = function (){
    	//$location.path( '/auth/spotify' );
    	$window.location.href = '/auth/logout';
	};
}]);
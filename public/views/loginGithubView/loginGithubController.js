angular.module('myApp.loginGithubView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/loginGithub', {
    templateUrl: '/views/loginGithubView/loginGithub.html',
    controller: 'loginGithubController'
  });
}])

.controller('loginGithubController', ['$scope','$window', function($scope,$window) {
	console.log("loginGithubController loaded");

	$scope.authorizeGithub = function (){
    	$window.location.href = '/auth/github';
	};
}]);
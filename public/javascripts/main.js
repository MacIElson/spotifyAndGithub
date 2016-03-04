/*
The main angular file, it controls everything 
*/

var myApp = angular.module('angular-wiki-article', ['ngRoute', 'ngMaterial'])
	.controller('MyController', ['MyService', '$scope', '$routeParams', '$location', MyController])

/*
Uses $routeProvider to inject the appropriate template url and set the appropriate controllwer. 
*/
myApp.config(
	function($routeProvider, $locationProvider) {
		$routeProvider.
		when('/article/:articleId', {
			templateUrl: '/html/article.html',
			controller: 'MyController as ul'
		}).
		otherwise({
			templateUrl: '/html/article.html',
			controller: 'MyController as ul'
		});

		$locationProvider.html5Mode({ enabled: true, requireBase: false });
	});

myApp.service('MyService', function($http) {

});

// Articles Controller for the Angular Material Start

function MyController(MyService, $scope, $routeParams, $location) {

}

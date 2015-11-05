/// <reference path="../../../typings/tsd.d.ts" />

require('angular');
require('angular-ui-router');

angular.module('lion', ['ui.router']);
angular.module('lion')
	.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
		$stateProvider
			.state('main', {
				url: '/',
				templateUrl: 'templates/main.html',
				resolve: {
					restrictedData: function (RestrictedDataService) {
						console.log('resolving the route-specific data only after I was let in by the authentication gateway!');
						return RestrictedDataService.getRestrictedData();
					}
				},
				controller: 'MainController',
				controllerAs: 'mainCtrl'
			})
			.state('login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'LoginController',
				controllerAs: 'loginCtrl'
			});
		$urlRouterProvider.otherwise('/');
		
		$httpProvider.interceptors.push('AuthInterceptor');
	})
	.run(function ($rootScope, $location, $state, AuthService) {
		$rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
			if (toState.name === 'login') {
				return;
			}
			
			if (!AuthService.getUserInfo().authenticated) {
				console.log('not logged in!');
				e.preventDefault();
				$state.go('login');
			}
		});
	})
	.service('LocalStorageService', function ($window) {
		this.set = function (key, value) {
			$window.localStorage.setItem(key, JSON.stringify(value));
		};
		
		this.get = function (key) {
			return JSON.parse($window.localStorage.getItem(key)) || {};
		}
	})
	.service('AuthService', function ($http, $q, LocalStorageService) {
		this.login = function (user) {
			return $http.post('/auth', user).then(function (res) {
				console.log(res);
				user.token = res.data.token;
				user.authenticated = true;
				LocalStorageService.set('user', user);
				return $q.when();
			}).catch(function () {
				console.log('invalid credentials!');
				return $q.reject({reason: 'invalid credentials'});
			});
		}
		
		this.getUserInfo = function () {
			return LocalStorageService.get('user');
		};
	})
	.factory('AuthInterceptor', function (LocalStorageService, $q, $injector) {
		return {
			request: function (config) {
				config.header = config.headers || {};
				if (LocalStorageService.get('user').token) {
					config.headers.Authorization = 'Bearer ' + LocalStorageService.get('user').token;
				}
				return config;
			},
			responseError: function (response) {
				//this is for the case when user is no longer authenticated - his token might have expired
				if (response.status === 401) {
					console.log('user not authenticated! the token might have expired!');
					$injector.get('$state').go('login');
				}
				return $q.reject(response);
			}
		};
	})
	.service('RestrictedDataService', function ($http) {
		this.getRestrictedData = function () {
			return $http.get('/api/restricted').then(function (res) {
				return res.data;
			});
		};
	})
	.controller('AppController', function (welcome) {
		var vm = this;
		vm.msg = welcome.text;
	})
	.controller('MainController', function (restrictedData) {
		var vm = this;
		vm.restrictedData = restrictedData;
	})
	.controller('LoginController', function (AuthService, $state) {
		var vm = this;
		vm.loginErrorVisible = false;
		vm.user = {};
		vm.login = function () {
			AuthService.login(vm.user).then(function () {
				$state.go('main');
			}).catch(function (error) {
				vm.loginErrorVisible = true;
				console.log(error.reason);
			});
		}
	})
	.value('welcome', {text: 'Hello - credentials are \'john.doe\' and \'foobar\''});

module.exports = angular.module('lion');
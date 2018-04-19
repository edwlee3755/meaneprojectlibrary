var app = angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

  // when users type default location, provide them with an object (our home page)
	$routeProvider.when('/', {
			templateUrl: 'app/views/pages/home.html',
			controller: 'homeCtrl',
			controllerAs: 'home'
	}) //note there is no ';' because we want another '.when()' for the abouts page

	.when('/about', {
			templateUrl: 'app/views/pages/about.html'
	})

  .when('/register', {
	      templateUrl: 'app/views/pages/users/register.html',
	      controller: 'regController',
	      controllerAs: 'register',
				authenticated: false			// must not be authenticated(logged out) to be able to register
  })

	.when('/login', {
			templateUrl: 'app/views/pages/users/login.html',
			authenticated: false	// must not be authenticated(logged out) to be able to login
	})

	.when('/logout', {
			templateUrl: 'app/views/pages/users/logout.html',
			authenticated: true		// must be autheticated(logged in) to be able to logout
	})

	.when('/profile', {
			templateUrl: 'app/views/pages/users/profile.html',
			authenticated: true
	})

	.when('/management', {
			templateUrl: 'app/views/pages/management/management.html',
			controller: 'managementCtrl',
			controllerAs: 'management',
			authenticated: true,
			permission: ['admin', 'moderator']
	})

	.when('/editUser/:id', {
			templateUrl: 'app/views/pages/management/editUser.html',
			controller: 'editUserCtrl',
			controllerAs: 'editUser',
			authenticated: true,
			permission: ['admin', 'moderator']
	})

	.when('/search', {
			templateUrl: 'app/views/pages/management/search.html',
			controller: 'managementCtrl',
			controllerAs: 'management',
			authenticated: true,
			permission: ['admin', 'moderator']
	})

	.otherwise({ redirectTo: '/'} ); // if users type in anything else, redirect to home

  // this is to get rid of angular's default '#' in the url (ie localhost/#/home)
	$locationProvider.html5Mode({
		  enabled: true,
		  requireBase: false
	});
});

// restrict routes
app.run(['$rootScope', 'Auth', '$location', 'User', 'Post', 'postImgUpload', function($rootScope, Auth, $location, User, Post, postImgUpload){
		$rootScope.$on('$routeChangeStart', function(event, next, current){
				if (next.$$route.authenticated == true){	// if this page needs to be authenticated to access
						if (!Auth.isLoggedIn()) {			// if the user is not logged in
								event.preventDefault();			// prevent user from this default route
								$location.path('/'); 				//	redirect user to home instead
						} else if (next.$$route.permission) {			// else if the route needs specific permissions
								User.getPermission().then(function(data) {		// get the users permissions and then check their permission
										if (next.$$route.permission[0] !== data.data.permission) {		// if the user permission is not an admin
												if (next.$$route.permission[1] !== data.data.permission) {	// if the user permission is not a moderator
														event.preventDefault();			// prevent user from this default route
														$location.path('/'); 				//	redirect user to home instead
												}
										}
								});
						}
				} else if (next.$$route.authenticated == false) {		// else if this page requires NOT logged in
							if (Auth.isLoggedIn()) {		// if user is logged in
									event.preventDefault();			// prevent user from accessing and redirect to profile page
									$location.path('/profile');
							}
				}
	});
}]);

angular.module('authServices', [])
// factory used for authenticating user (ie. logging in, checking if user is logged in etc)
.factory('Auth', function($http, AuthToken){ // we reference AuthToken in the 'Auth' factory because it uses 'AuthToken'. 'AuthToken' doesn't use 'Auth' factory so it is not referenced below
  var authFactory = {};

  // User.create(regData)
  authFactory.login = function(loginData){
    return $http.post('/api/authenticate', loginData).then(function(data){ // authenticate user, if successful authenticate api assigns user a jsonwebtoken
      AuthToken.setToken(data.data.token); // after making the http post request to authenticate, run function which sets the token given to the user into local storage (browser)
      console.log(data.data.token);
      return data;
    });
  }

  // Auth.isLoggedIn();
  authFactory.isLoggedIn = function(){
    if (AuthToken.getToken()){
      return true;
    }
    else {
      return false;
    }
  };

  // Auth.getUser();
  authFactory.getUser = function(){
    console.log('testing get token');
    if (AuthToken.getToken()) {
      return $http.post('/api/currentUser');
    }
    else {
      $q.reject({ message: 'User has no token' });
    }
  };

  // Auth.logout();
  authFactory.logout = function(){
    AuthToken.setToken(); // calls set token, but does not provided a token. this causes setToken to go to else statement which removes 'token'
  };

  return authFactory;
})

// factory to store json web token into local storage
.factory('AuthToken', function($window){ // reference $window because it is used in setToken()
  var authTokenFactory = {};

  // AuthToken.setToken(token);
  authTokenFactory.setToken = function(token) {
    if (token){ // if the token is provided (auth.login provides token), then store in local storage
      $window.localStorage.setItem('token', token); // angular to store 'token' into browser with our token value
    }
    else {
      $window.localStorage.removeItem('token');
    }

  };

  // AuthToken.getToken():
  authTokenFactory.getToken = function(){
    return $window.localStorage.getItem('token'); // function to search localstorage in the browser to search for 'token' and grab its value
  };

  return authTokenFactory;
})


.factory('AuthInterceptors', function(AuthToken){
  var AuthInterceptorsFactory = {};

  AuthInterceptorsFactory.request = function(config){
    var token = AuthToken.getToken();

    if (token) config.headers['x-access-token'] = token;  // assign the token to the header so we can grab the token from the header to check if user is logged in

    return config;
  };

  return AuthInterceptorsFactory;
});

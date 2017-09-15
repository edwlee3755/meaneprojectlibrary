// main configuartion file
// angular.module('name of module', [dependencies used such as routes, cookies etc]);
// we inject 'appRoutes' as a dependecy so that app.js can feed the routes.js file to our index page
angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'mainController', 'authServices', 'managementController']) // need to insert this angular application into our index to use

.config(function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptors'); // config application to intercept all http requests with this factory to assign the token to the header
});

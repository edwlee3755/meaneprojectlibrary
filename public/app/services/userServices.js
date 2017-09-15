angular.module('userServices', [])
// factory used for custom functions like registering etc
.factory('User', function($http){
  userFactory = {};

  // User.create(regData)
  userFactory.create = function(regData){
    return $http.post('/api/users', regData);
  };

  // User.renewSession(username);
  userFactory.renewSession = function (username) {
    return $http.get('/api/renewToken/' + username);
  };

  userFactory.getPermission = function() {
    return $http.get('/api/permission/');
  };

  userFactory.getUsers = function() {
    return $http.get('/api/management/')
  };

  userFactory.getUser = function(id) {
    return $http.get('/api/editUser/' + id);
  };

  userFactory.deleteUser = function(username) {
    return $http.delete('/api/management/' + username)
  };

  userFactory.editUser = function(id) {
    return $http.put('/api/editUser', id)
  };

  return userFactory;
});

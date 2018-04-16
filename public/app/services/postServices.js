angular.module('postServices', [])
// factory used for custom functions like registering etc
.factory('Post', function($http){
  postFactory = {};

  // User.create(regData)
  postFactory.create = function(createPostData){
    return $http.post('/api/posts', createPostData);
  };

  postFactory.getPosts = function () {
    return $http.get('/api/getPosts');
};

  return postFactory;
});

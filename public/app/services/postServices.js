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

/*
.service('postImgUpload', function($http) {
    this.upload = function(ngPostImgFile) {  //parsed file gets passed into this function of the service
        var fd = new FormData();
        fd.append('postImg', ngPostImgFile);
        return $http.post('/api/upload', fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        });
    };
});
*/

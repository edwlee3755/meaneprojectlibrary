angular.module('homeController', ['fileInputDirective'])

.controller('homeCtrl', function(Post, $timeout, $scope) {
    var app = this;
    app.loading = true;
    app.errorMsg = false;


    function getPosts() {
        Post.getPosts().then(function(data) {
          if (data.data.success) {
            app.posts = data.data.posts;
            console.log(app.posts);
            app.loading = false;
          } else {
              app.errorMsg.data.data.message;
              app.loading = false;
          }
        });
    }

    getPosts();
});

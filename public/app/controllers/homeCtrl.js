angular.module('homeController', [])

.controller('homeCtrl', function(Post, $timeout, $scope) {
    var app = this;
    app.loading = true;
    app.errorMsg = false;


    function getPosts() {
        Post.getPosts().then(function(data) {
          if (data.data.success) {
            app.posts = data.data.posts;
            console.log(app.posts);
            for ( i=0; i < app.posts.length; i++)
            {
              console.log('postimgdata: ' + app.posts[i].postImg.data);
              //var notConverted64 = app.posts[i].postImg.data;
              //var converted64 = notConverted64.toString('base64');
              //app.posts[i].postImg.data = converted64;
            //  var notDecoded = app.posts[i].postImg.data;
              //var decodedData = atob(notDecoded);
              //app.posts[i].postImg.data = decodedData;
              //app.posts[i].postImg.data = "hello test";

              //test with array buffer to base64 //
              //var binary = '';
            //  var bytes = new Uint8Array(app.posts[i].postImg.data);
              //var len = bytes.byteLength;
              //for (var i = 0; i < len; i++) {
              //    binary += String.fromCharCode( bytes[ i ] );
            //  }
              //var encodedString = window.btoa(binary);
              //app.posts[i].postImg.data = encodedString;
              //console.log('postimgdata encoded string from home: ' + app.posts[i].postImg.data);
              //console.log('postimgdata from home: ' + app.posts[i].postImg.data);
            }
            app.loading = false;
          } else {
              app.errorMsg.data.data.message;
              app.loading = false;
          }
        });
    }

    getPosts();
})

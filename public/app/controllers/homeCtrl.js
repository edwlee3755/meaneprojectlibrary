angular.module('homeController', ['fileInputDirective', 'authServices'])

.controller('homeCtrl', function(Post, $timeout, $scope, Auth) {
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

    if (Auth.isLoggedIn()){
      // get the username
      Auth.getUser().then(function(data) {
        app.username = data.data.username;
      });
    }


    app.viewPostModal = function(posts, commentCheck) {
        if (!(posts == undefined)) {
          app.post = posts;
          console.log(app.post);
        }
        //console.log('2' + app.post);
        //console.log('test: ' + app.post.title);
        app.postComments = app.post.postComments;
        app.imageSaved = false;
        app.title = app.post.title;
        app.postDescription = app.post.postDescription;
        app.postImgUrl = app.post.postImgUrl;
        if (!(app.postImgUrl == '/app/views/uploads/images/placeholder.png')) {
            app.imageSaved = true;
        }
        app.postDate = app.post.date;
        app.postAuthor = app.post.postAuthor;
        app.upvotes = app.post.upvotes;
        console.log('post id: ' + app.post._id);
        console.log('post comments: ' + app.postComments);
        if (!(commentCheck == '' || commentCheck == undefined)) {
            console.log('comment was passed: ' + commentCheck);
            //get post and save to database
              var postObject = {};
              var comment = app.username + ': ' + commentCheck;
              postObject._id = app.post._id;
              postObject.postComments = app.post.postComments
              postObject.postComments.push(comment);
              console.log('postObject.postComments[0]: ' + postObject.postComments[0]);
              $scope.viewPostCreateComment = '';
              Post.saveComment(postObject).then(function(data){
                if (data.data.success) {  // If post comments have been successfully edited
                    console.log('Comments has been successfully updated');

                } else {
                    console.log('error msg: ' + data.data.message);
                    console.log('Failed to update comments');
                }
              });
        } else {
          console.log('showing viewpostmodal');
          $("#viewPostModal").modal({backdrop: "true" });
        }
        //$("#createPostModal").modal({backdrop: "true" });
    };

    app.updateViewPostModal = function(comment) {
        app.username = 'initial';
        //$("#viewPostModal").modal("hide");
        Auth.getUser().then(function(data) {       // grab the user data
          app.username = data.data.username;      // save the user's data for use in html
          app.title = app.username;
          app.newComment = app.usename + ': ' + comment;
        });
        //get post id and save to the post.comment array


        //app.postComments = post.postComments;
    };

    this.clearPostText = function() {
        console.log("Cleared Post Text");
        console.log(app.createPostData);
        console.log(app.createPostData.postTitle);
        app.createPostData = {};
        console.log(app.createPostData);
    };
});

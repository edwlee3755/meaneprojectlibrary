angular.module('mainController', ['authServices', 'userServices', 'postServices', 'fileInputDirective'])

.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope, $interval, $window, $route, User, AuthToken, $scope, Post, $http, postImgUpload, $parse){
  var app = this;

  app.loadme = false; // hide main html page until data is obtained in angularjs

  app.checkSession = function() {
    if (Auth.isLoggedIn()) {
      app.checkingSession = true;
      var interval = $interval(function(){
        var token = $window.localStorage.getItem('token');
        if (token === null) {   // if token is expired, we don't need to check if token is expired every interval anymore
          $interval.cancel(interval);
        }
        else {
          // function to take a token and parse the time of when the token was assigned in timestamp format
          self.parseJwt = function(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
          }
          var expireTime = self.parseJwt(token);  // save parsed token into variable
          var timeStamp = Math.floor(Date.now() / 1000);  // get the current time in timestamp and change to seconds
          var timeCheck = expireTime.exp - timeStamp;     // from current time, count down until current time matches the timestamp of the token
          console.log(timeCheck);


          if (timeCheck <= 39 && timeCheck >= 4) {   // when current time matches time stamp of the assigned token, the token has expired. We use 4 second buffer because it takes time to logout
            console.log('Token will expire in ' + timeCheck + ' seconds.');
            showLogoutModal(1);
            //$interval.cancel(interval);
          }

          else if (timeCheck <= 4) {
            app.choiceMade = true;
            hideModal();
            $timeout(function() {
              showLogoutModal(2);     // logout user modal after 1 second
            }, 1000);
          }
          else {
            console.log('Token not yet expired');
          }

        }
      }, 2000);
    }
  };

  app.checkSession();
  console.log('testing random print');


  var showLogoutModal = function(option) {                        // function to show our modal
    app.choiceMade = false;                           // var to check if the user has selected a choice on our modal to renew or expire
    app.modalHeader = undefined;              // modal title and body
    app.modalBody = undefined
    app.hideButtons = false;

    if (option === 1) {                                 // modal to warn user of session expire
      app.modalHeader = 'Timeout Warning';              // modal title and body
      app.modalBody = 'Your session will expire in 30 seconds from now. Would you like to continue your session or logout?';
      $("#logoutModal").modal({ backdrop: "static" });      // backdrop static makes it so when the modal is loaded, we cause the background to be non-clickable so use can't click out of modal unless they click yes / no / x
    }
    else if (option === 2){               // logout modal
      //logout portion
      app.hideButtons = true;                       // hide the yes / no buttons of our modal when displaying the logout modal
      app.modalHeader = undefined;              // modal title and body
      $("#logoutModal").modal({ backdrop: "static" });
      $timeout(function(){
        Auth.logout();
        $location.path('/');
        hideModal();
        $route.reload();    // reload the page incase the user is already on the home page so the controller can log them out
      }, 2000);
    }

  };

  app.showCreatePostModal = function() {
      console.log("showCreatePostModal function");
      app.postModalHeader = "Create a Post";
      $("#createPostModal").modal({backdrop: "static" });
  };

  this.clearPostText = function() {
      console.log("Cleared Post Text");
      console.log(app.createPostData);
      console.log(app.createPostData.postTitle);
      app.createPostData = {};
      console.log(app.createPostData);
  };

  this.createPost = function(createPostData, valid, ngPostImgFile) {
    app.loading = true;   // when register button is clicked, set loading to true to display the loading icon
    app.errorMsg = false; // set the error message to false so it does not show up in register.html until the message is set

    console.log("Valid value: " + valid);
    if (valid) {
        console.log('ngpost file: ' + ngPostImgFile);
        console.log("before date");
        // if valid, we need to get the date in mm/dd/yyyy before we have all the data
        var dateObj = new Date();
        var year = dateObj.getFullYear();
        var day = dateObj.getDate();
        var formattedDay;
        var formattedMonth;
        if ( day == 1 || day == 21 || day == 31) { formattedDay = day + "st"; }
        else if ( day == 2 || day == 22 ) { formattedDay = day + "nd"; }
        else if ( day == 3 || day == 23 ) { formattedDay = day + "rd"; }
        else { formattedDay = day + "th"; }

        var month = dateObj.getMonth() + 1; // months from 1-12 (january is 0)
        if ( month == 1) { formattedMonth = "Jan." }
        else if ( month == 2) { formattedMonth = "Feb."; }
        else if ( month == 3) { formattedMonth = "Mar."; }
        else if ( month == 4) { formattedMonth = "Apr."; }
        else if ( month == 5) { formattedMonth = "May."; }
        else if ( month == 6) { formattedMonth = "Jun."; }
        else if ( month == 7) { formattedMonth = "Jul."; }
        else if ( month == 8) { formattedMonth = "Aug."; }
        else if ( month == 9) { formattedMonth = "Sept."; }
        else if ( month == 10) { formattedMonth = "Oct."; }
        else if ( month == 11) { formattedMonth = "Nov."; }
        else if ( month == 12) { formattedMonth = "Dec."; }
        else { formattedMonth = "Err"; }

        var currentDate = formattedMonth + " " + formattedDay + ", " + year;

        app.createPostData.date = currentDate;
        app.createPostData.postAuthor = app.username;

        var localHours = dateObj.getHours();
        var localMinutes = dateObj.getMinutes();

        if (ngPostImgFile != undefined)
        {
          console.log(ngPostImgFile);
          var filename = ngPostImgFile.name;
          // IMPORTANT: On Heroku, the path of api.js is /app/app/routes whereas in localhost, it is /meaneprojectlibrary/app/routes. Heroku switches meaneprojectlibrary with app
          // Heroku puts contents inside meaneprojectlibrary into a folder it creates called app. So now we need /root(meaneprojectlibrary)/app/public/uploads
          app.createPostData.postImgUrl = '/app/public/uploads/' + month + '_' + day + '_' + localHours + '_' + localMinutes + '_' + filename;
          var fileReader = new FileReader();
          console.log("filename: " + filename);
          var fileExtension = filename.split('.').pop();

          var fileRead = "fail";
          var base64EncodedString;
          fileReader.readAsDataURL(ngPostImgFile);
          fileReader.onload = function() {
            fileRead = fileReader.result;
            var base64Split = fileRead.split(',');
            base64String = base64Split[1];
            var fileType = "image/" + fileExtension;
            console.log("fileType: " + fileType);

            app.createPostData.postImg = fileRead;
            app.createPostData.contentType = fileType;

            postImgUpload.upload(ngPostImgFile).then(function(data) {
              if (data.data.success) {  // if image uploaded to local directory
                console.log('Date main ctrl: ' + Date.now());
                  Post.create(app.createPostData).then(function(data){    //save post data
                      if (data.data.success) {
                          console.log("data was success");
                          app.loading = false;
                          app.successMsg = data.data.message; // if the current user was successful in posting
                          // redirect to home page - after a timeout run a function which redirects
                          $timeout(function(){
                            $location.path('/');
                            app.successMsg = false; // clear out login form data successful login msg once we are logged in
                          }, 2000);
                      }
                      else {
                          console.log("post data was failed");
                          app.loading = false;
                          // Create an error message
                          app.errorMsg = data.data.message; // sets the errorMsg to true

                          //test
                          $timeout(function(){
                            app.errorMsg = false;
                          }, 5000);
                          //test
                      }
                  });
              } else {  // else if image upload to local directory failed
                    console.log("image data was failed");
                    app.loading = false;
                    // Create an error message
                    app.errorMsg = data.data.message; // sets the errorMsg to true

                    //test
                    $timeout(function(){
                      app.errorMsg = false;
                    }, 5000);
                    //test
              }
            });

          };    // end of file reader onload
        } else {  // else statement for if filearray has no files selected so filelist has no elements
            console.log('no image selected: ');
            Post.create(app.createPostData).then(function(data){
                if (data.data.success) {
                    console.log("data was success");
                    app.loading = false;
                    app.successMsg = data.data.message; // if the current user was successful in posting
                    // redirect to home page - after a timeout run a function which redirects
                    $timeout(function(){
                      $location.path('/');
                      app.successMsg = false; // clear out login form data successful login msg once we are logged in
                    }, 2000);
                }
                else {
                    console.log("data was failed");
                    app.loading = false;
                    // Create an error message
                    app.errorMsg = data.data.message; // sets the errorMsg to true

                    //test
                    $timeout(function(){
                      app.errorMsg = false;
                    }, 5000);
                    //test
                }
            });
        }
    }
    else { // else statement for (if valid)
        app.loading = false;
        // Create an error message
        app.errorMsg = 'Please ensure form is filled out properly'; // sets the errorMsg to true

        //test
        $timeout(function(){
          app.errorMsg = false;
        }, 10000);
        //test
    }
  };



  app.renewSession = function() {         // index modal runs this function if user selects yes to renew session
    app.choiceMade = true;

    // We already have app.username because we retrieved that when the user logged in.
    User.renewSession(app.username).then(function(data) {
      if (data.data.success) {
        AuthToken.setToken(data.data.token);
        app.checkSession();
      }
      else {
        app.modalBody = data.data.message;
      }
    });
    hideModal();
  };

  app.endSession = function () {          // index modal runs this function if user selects no to expire session
    app.choiceMade = true;
    hideModal();
    $timeout(function() {
      showLogoutModal(2);     // logout user modal after 1 second
    }, 1000);
  };

  var hideModal = function () {           // function to hide our modal
    $("#logoutModal").modal('hide');
  };


  // Anytime a route changes, run this code
  $rootScope.$on('$routeChangeStart', function(){
    if (!app.checkSession) {
      app.checkSession();
    }
    // Check if the user is logged in
    if (Auth.isLoggedIn()){
      app.isLoggedIn = true;  // Variable to activate ng-show on index.html

      Auth.getUser().then(function(data) {       // grab the user data
        app.username = data.data.username;      // save the user's data for use in html
        app.useremail = data.data.email;

        // After the user logs in and data is retrieved, get user permissions and set authorized to true if user is an admin or moderator
        User.getPermission().then(function(data) {
          if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
            app.authorized = true;
            app.loadme = true;  // Show main html page now that data is obtained in angularjs
          }
          else {
            app.authorized = false;
            app.loadme = true;  // Show main html page now that data is obtained in angularjs
          }
        });
      });
    }
    else {
      app.isLoggedIn = false;     // Set variable to false because user is not logged in
      app.username = "";          // If the user is not logged in, clear out the username variable so the username does not display on browser
      app.loadme = true;          // Show main html page now that data is obtained
    }

  });

  // Reset the username and password login fields when the user switches between routes when not logged in
  this.hideLoginInput = function(loginData) {
    app.loginData = {};
  };

  this.doLogin = function(loginData){ // regData contains all input field data
    app.loading = true;   // when register button is clicked, set loading to true to display the loading icon
    app.errorMsg = false; // set the error message to false so it does not show up in register.html until the message is set
    app.disabled = true;

    // call the "User" factory create() function in userServices to make an http request to $http.post('/api/users', regData);
    // after the http request is made, we pass the data into the '.then' function
    Auth.login(app.loginData).then(function(data){
      if (data.data.success) {
        app.loading = false; // when the data has finished loading, set loading to false to hide the loading icon
        // Create success message
        app.successMsg = data.data.message + '..Redirecting to Home'; // if the current user was successful in registering
        // redirect to home page - after a timeout run a function which redirects
        $timeout(function(){
          $location.path('/');
          app.loginData = {}; // clear out login form data once we are logged in. Must set to empty object or we get : TypeError: Cannot create property 'username' on string ''
          app.successMsg = false; // clear out login form data successful login msg once we are logged in
          app.disabled = false;
          app.checkSession();
        }, 2000);
      }
      else {
        app.loading = false;
        // Create an error message
        app.errorMsg = data.data.message; // sets the errorMsg to true
        app.disabled = false;

        //test
        $timeout(function(){
          app.errorMsg = false;
        }, 5000);
        //test
      }
    });
  };

  app.logout = function() {
    showLogoutModal(2);
  };

});

angular.module('mainController', ['authServices', 'userServices'])

.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope, $interval, $window, $route, User, AuthToken, $scope){
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

          if (timeCheck <= 35) {   // when current time matches time stamp of the assigned token, the token has expired
            console.log('Token will expire in 35 seconds.')
            showModal(1);
            $interval.cancel(interval);
          }
          else {
            console.log('Token not yet expired');
          }


        }
      }, 2000);
    }
  };

  app.checkSession();

  var showModal = function(option) {                        // function to show our modal
    app.choiceMade = false;                           // var to check if the user has selected a choice on our modal to renew or expire
    app.modalHeader = undefined;              // modal title and body
    app.modalBody = undefined
    app.hideButtons = false;

    if (option === 1) {                                 // modal to warn user of session expire
      app.modalHeader = 'Timeout Warning';              // modal title and body
      app.modalBody = 'Your session will expire in 30 seconds. Would you like to continue your session or logout?';
      $("#myModal").modal({ backdrop: "static" });      // backdrop static makes it so when the modal is loaded, we cause the background to be non-clickable so use can't click out of modal unless they click yes / no / x
    }
    else if (option === 2){               // logout modal
      //logout portion
      app.hideButtons = true;                       // hide the yes / no buttons of our modal when displaying the logout modal
      app.modalHeader = undefined;              // modal title and body
      $("#myModal").modal({ backdrop: "static" });
      $timeout(function(){
        Auth.logout();
        $location.path('/');
        hideModal();
        $route.reload();    // reload the page incase the user is already on the home page so the controller can log them out
      }, 2000);
    }
    $timeout(function(){
      if (!app.choiceMade) {
        Auth.logout();
        $location.path('/');
        console.log('Logged out');
        hideModal();
        $route.reload();    // reload the page incase the user is already on the home page so the controller can log them out
      }
    }, 35000);              // set the timeout of the modal to stay on the user's screen until token expires or response is clicked

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

  app.endSession = function () {          // index modal runs this function if user selectsno to expire session
    app.choiceMade = true;
    hideModal();
    $timeout(function() {
      showModal(2);     // logout user modal after 1 second
    }, 1000);
  };

  var hideModal = function () {           // function to hide our modal
    $("#myModal").modal('hide');
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
    showModal(2);
  };

});

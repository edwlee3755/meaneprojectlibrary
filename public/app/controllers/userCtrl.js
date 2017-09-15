angular.module('userControllers', ['userServices'])

// we pass this controller into our application by defining in our routes
.controller('regController', function($http, $location, $timeout, User){

  var app = this; // this allows us to access the data specific to the current user

  this.regUser = function(regData, valid){ // regData contains all input field data
    app.loading = true;   // when register button is clicked, set loading to true to display the loading icon
    app.errorMsg = false; // set the error message to false so it does not show up in register.html until the message is set

    if (valid) {    // if the register form follows valid requirements, then create in the database and check for duplicate user
      // call the "User" factory create() function in userServices to make an http request to $http.post('/api/users', regData);
      // after the http request is made, we pass the data into the '.then' function
      User.create(app.regData).then(function(data){
        if (data.data.success) {
          app.loading = false; // when the data has finished loading, set loading to false to hide the loading icon
          // Create success message
          app.successMsg = data.data.message + '..Redirecting to Home'; // if the current user was successful in registering
          // redirect to home page - after a timeout run a function which redirects
          $timeout(function(){
            $location.path('/');
          }, 2000);
        }
        else {
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
    else {
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
});

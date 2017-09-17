angular.module('managementController', [])

.controller('managementCtrl', function(User, $timeout, $scope) {

  var app = this;

  // Hide everything until current user has been verified to have proper permissions
  app.loading = true;
  app.accessDenied = true;
  app.errorMsg = false;
  app.editAccess = false;
  app.deleteAccess = false;
  app.showLimit = 25;
  app.searchLimit = undefined;

  app.filterDetected = false;
  app.filteringByUsername = false;
  app.filteringByEmail = false;
  app.filteringByFirstName = false;
  app.filteringByMiddleName = false;
  app.filteringByLastName = false;

  // create a function which gets Users AND checks permission after calling getUsers in userServices
  function getUsers() {
    // Under userServices, run getUsers
    User.getUsers().then(function(data) {
      if (data.data.success) {
          if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
              app.users = data.data.users;  // collection of all users
              console.log(app.users);
              app.loading = false;
              app.accessDenied = false;
              // If the user is an admin, then allow them to delete and edit
              if (data.data.permission === 'admin') {
                  app.editAccess = true;
                  app.deleteAccess = true;
              } else if (data.data.permission === 'moderator') {    // else if moderator, only edit
                  app.editAccess = true;
              }

          } else {
              app.errorMsg = 'Insufficient Permissions';
              app.loading = false;

          }
      } else {
          app.errorMsg.data.data.message;
          app.loading = false;
      }
    });
  }

  getUsers();

  app.showMore = function(number) {
        if (number > 0) {
            app.showLimit = number; // set the limit of displayed results to the number in the form
            $scope.number = undefined; // Clears out "number" in results to display input field
        } else {
            app.showMoreError = 'Please enter a valid number';
            // Hide the error alert after 3 seconds
            $timeout(function () {
              app.showMoreError = false;
            }, 3000);
        }
  };

  app.showAll = function() {
      //$scope lets us go into the scope of the management html and find ng-model="number" (the number of display results)
      $scope.number = undefined;
      app.showLimit = undefined;
      app.showMoreError = false;
  };

  app.deleteUser = function(username) {
      User.deleteUser(username).then(function(data) {
          if (data.data.success) {
              getUsers();
          } else {
              app.showMoreError = data.data.message;
          }
      });
  };

  app.search = function(searchKeyword, number) {
      // Check if there is a keyword the user entered
      if(searchKeyword) {
          if (searchKeyword.length > 0) {
              console.log(searchKeyword);
              app.showLimit = 0;  // First clear out the limit to display everything
              $scope.searchFilter = searchKeyword; // Apply the filter of the keyword
              app.showLimit = number; // Then set the show limit

          } else {
              console.log( '<=0');
              $scope.searchFilter = undefined;
              app.showLimit = number;
          }

      } else {
          console.log( 'searchkeyword = false');
          $scope.searchFilter = undefined;
          app.showLimit = number;
      }
  };

  app.clear = function() {
      $scope.number = undefined;
      app.showLimit = 0;
      $scope.searchKeyword = undefined;
      $scope.searchFilter = undefined;
      app.showMoreError = false;
  };


  // User Search functionality
  app.advancedSearch = function(searchByUsername, searchByEmail, searchByFirstName, searchByMiddleName, searchByLastName, searchNumber) {
      if (searchByUsername || searchByEmail || searchByFirstName || searchByMiddleName || searchByLastName) {
          $scope.advancedSearchFilter = {}; // Make it an empty object so we can append values into it and change as neccessary
          if (searchByUsername) {
              $scope.advancedSearchFilter.username = searchByUsername;    // If there is a username to search by, set the value of our object (matching our database value) to the search value
              app.filterDetected = true;
              app.filteringByUsername = true;
          } else {
              app.filteringByUsername = false;
          }
          if (searchByEmail) {
              $scope.advancedSearchFilter.email = searchByEmail;
              app.filterDetected = true;
              app.filteringByEmail = true;
          } else {
              app.filteringByEmail = false;
          }
          if (searchByFirstName) {
              $scope.advancedSearchFilter.firstName = searchByFirstName;
              app.filterDetected = true;
              app.filteringByFirstName = true;
          } else {
              app.filteringByFirstName = false;
          }
          if (searchByMiddleName) {
              $scope.advancedSearchFilter.middleName = searchByMiddleName;
              app.filterDetected = true;
              app.filteringByMiddleName = true;
          } else {
              app.filteringByMiddleName = false;
          }
          if (searchByLastName) {
              $scope.advancedSearchFilter.lastName = searchByLastName;
              app.filterDetected = true;
              app.filteringByLastName = true;
          } else {
              app.filteringByLastName = false;
          }
      } else {
          app.filterDetected = false;
          app.filteringByUsername = false;
          app.filteringByEmail = false;
          app.filteringByFirstName = false;
          app.filteringByMiddleName = false;
          app.filteringByLastName = false;
          $scope.advancedSearchFilter = undefined;
      }
      if (searchNumber > 0) {
          console.log('search limit > 0');
          app.searchLimit = searchNumber;
      } else {
          console.log('no search limit');
          app.searchLimit = undefined;
      }
  };

  app.clearFilterFields = function() {
      $scope.advancedSearchFilter = {};
      $scope.searchByUsername = undefined;
      $scope.searchByEmail = undefined;
      $scope.searchByFirstName = undefined;
      $scope.searchByMiddleName = undefined;
      $scope.searchByLastName = undefined;
      app.filterDetected = false;
      app.filteringByUsername = false;
      app.filteringByEmail = false;
      app.filteringByFirstName = false;
      app.filteringByMiddleName = false;
      app.filteringByLastName = false;
  };

  app.sortOrder = function (order) {
      app.sort = order;
  };

})

.controller('editUserCtrl', function($scope, $routeParams, User, $timeout) {
    var app = this;
    $scope.nameTab = 'active'; // Set the 'name' tab to the default active tab
    app.phase1 = true;         // set phase1 default so we show the name input fields

    // Get the user's info by calling getUser in userServices. Then we fill out the form input fields with data from the database
    User.getUser($routeParams.id).then(function(data) {
        console.log(data);
        if (data.data.success) {
            // Grab the values from the returned user for use
            console.log('Editting User: ' + data.data.user.firstName);
            $scope.newFirstName = data.data.user.firstName;
            $scope.newMiddleName = data.data.user.middleName;
            $scope.newLastName = data.data.user.lastName;
            // We take the id instead of username because username will conflict with our api. Api will update username if it detects a username which we don't want
            app.edittedUser = data.data.user._id;  // Here we set our variable using app.edittedUser instead of $scope because we don't need to take the value from the edit form (for clarity since this is the edit name section)
            $scope.newEmail = data.data.user.email;
            $scope.newUsername = data.data.user.username;
            $scope.newPermission = data.data.user.permission;

        } else {
            console.log('failed to get user data. Id= ' + $routeParams.id);
            app.errorMsg = data.data.message;
        }
    });

    app.namePhase = function() {
        console.log('in NamePhase');
        $scope.nameTab = 'active'; // Set name list to active
        $scope.usernameTab = 'default'; // Clear username class
        $scope.emailTab = 'default'; // Clear email class
        $scope.permissionsTab = 'default'; // Clear permission class
        app.phase1 = true;
        app.phase2 = false;
        app.phase3 = false;
        app.phase4 = false;
    };

    app.usernamePhase = function() {
        console.log('in usernamePhase');
        $scope.nameTab = 'default'; // Set name list to active
        $scope.usernameTab = 'active'; // Clear username class
        $scope.emailTab = 'default'; // Clear email class
        $scope.permissionsTab = 'default'; // Clear permission class
        app.phase1 = false;
        app.phase2 = true;
        app.phase3 = false;
        app.phase4 = false;
    };

    app.emailPhase = function() {
        console.log('in emailPhase');
        $scope.nameTab = 'default'; // Set name list to active
        $scope.usernameTab = 'default'; // Clear username class
        $scope.emailTab = 'active'; // Clear email class
        $scope.permissionsTab = 'default'; // Clear permission class
        app.phase1 = false;
        app.phase2 = false;
        app.phase3 = true;
        app.phase4 = false;
    };

    app.permissionsPhase = function() {
        console.log('in permissionPhase');
        $scope.nameTab = 'default'; // Set name list to active
        $scope.usernameTab = 'default'; // Clear username class
        $scope.emailTab = 'default'; // Clear email class
        $scope.permissionsTab = 'active'; // Clear permission class
        app.phase1 = false;
        app.phase2 = false;
        app.phase3 = false;
        app.phase4 = true;
        //Variables to hide permission buttons that the user already has (ie. if user being editted is a moderator, hide the button which changes permissions for them to become a moderator)
        app.disableUser = false;
        app.disableModerator = false;
        app.disableAdmin = false;

        if ($scope.newPermission === 'user') {
            app.disableUser = true;
        } else if ($scope.newPermission === 'moderator') {
            app.disableModerator = true;
        } else if ($scope.newPermission === 'admin') {
            app.disableAdmin = true;
        }

    };

    // Function to take the values of the name form and EDIT into database
    app.updateName = function(newFirstName, newMiddleName, newLastName, firstNameValid, middleNameValid, lastNameValid) {
        app.errorMsg = false;
        app.disabled = true;
        var userObject = {};

        // If edit form inputs are valid
        if (firstNameValid && middleNameValid && lastNameValid) {
            userObject._id = app.edittedUser;
            userObject.firstName = $scope.newFirstName;
            userObject.middleName = $scope.newMiddleName;
            userObject.lastName = $scope.newLastName;

            User.editUser(userObject).then(function(data){
                if (data.data.success) {  // If user has been successfully edited
                    console.log('User has been successfully updated');
                    app.successMsg = data.data.message;
                    // Timeout to clear the form after editting
                    $timeout(function() {
                        // Reset the form fields so they look unedited again
                        app.nameForm.firstName.$setPristine();
                        app.nameForm.firstName.$setUntouched();
                        app.nameForm.middleName.$setPristine();
                        app.nameForm.middleName.$setUntouched();
                        app.nameForm.lastName.$setPristine();
                        app.nameForm.lastName.$setUntouched();
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                } else {
                    console.log('Failed to update user');
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });

        } else {
            app.errorMsg = 'Please ensure form is filled out properly';
            app.disabled = false;
            $timeout(function() {
                app.errorMsg = false;
            }, 3000);
        }
    };

    app.updateUsername = function(newUsername, usernameValid) {
        app.errorMsg = false;
        app.disabled = true;
        // Create a user object to hold the data so we can send it to the api to process
        var userObject = {};

        // If edit form inputs are valid
        if (usernameValid) {
            // Fill the object with the value we are editting so that we can retrieve this information
            userObject._id = app.edittedUser;
            userObject.username = $scope.newUsername;
            console.log($scope.newUsername);
            console.log('user object: ' + userObject.username);
            console.log(userObject);

            User.editUser(userObject).then(function(data){
                if (data.data.success) {  // If user has been successfully edited
                    console.log('User has been successfully updated');
                    app.successMsg = data.data.message;
                    // Timeout to clear the form after editting
                    $timeout(function() {
                        // Reset the form fields so they look unedited again
                        app.usernameForm.username.$setPristine();
                        app.usernameForm.username.$setUntouched();
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                } else {
                    console.log('Failed to update user');
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                    $timeout(function() {
                        app.errorMsg = false;
                    }, 3000);
                }
            });

        } else {
            app.errorMsg = 'Please ensure form is filled out properly';
            app.disabled = false;
            $timeout(function() {
                app.errorMsg = false;
            }, 3000);
        }
    };

    app.updateEmail = function(newEmail, emailValid) {
        app.errorMsg = false;
        app.disabled = true;
        // Create a user object to hold the data so we can send it to the api to process
        var userObject = {};

        // If edit form inputs are valid
        if (emailValid) {
            // Fill the object with the value we are editting so that we can retrieve this information
            userObject._id = app.edittedUser;
            userObject.email = $scope.newEmail;
            console.log($scope.newEmail);

            User.editUser(userObject).then(function(data){
                if (data.data.success) {  // If user has been successfully edited
                    console.log('User has been successfully updated');
                    app.successMsg = data.data.message;
                    // Timeout to clear the form after editting
                    $timeout(function() {
                        // Reset the form fields so they look unedited again
                        app.emailForm.email.$setPristine();
                        app.emailForm.email.$setUntouched();
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                } else {
                    console.log('Failed to update user');
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                    $timeout(function() {
                        app.errorMsg = false;
                    }, 3000);
                }
            });

        } else {
            app.errorMsg = 'Please ensure form is filled out properly';
            app.disabled = false;
            $timeout(function() {
                app.errorMsg = false;
            }, 3000);
        }
    };

    app.updatePermissions = function(newPermission) {
        app.errorMsg = false;
        app.disableUser = true;
        app.disableModerator = true;
        app.disableAdmin = true;
        // Create a user object to hold the data so we can send it to the api to process
        var userObject = {};

        // Fill the object with the value we are editting so that we can retrieve this information
        userObject._id = app.edittedUser;
        userObject.permission = newPermission;

        User.editUser(userObject).then(function(data){
            if (data.data.success) {  // If user has been successfully edited
                console.log('User has been successfully updated');
                app.successMsg = data.data.message;
                // Timeout to clear the form after editting
                $timeout(function() {
                    app.successMsg = false;
                    if (newPermission === 'user') {
                        $scope.newPermission = 'user';
                        app.disableUser = true;
                        app.disableModerator = false;
                        app.disableAdmin = false;
                    } else if (newPermission === 'moderator') {
                        $scope.newPermission = 'moderator';
                        app.disableUser = false;
                        app.disableModerator = true;
                        app.disableAdmin = false;
                    } else if (newPermission === 'admin') {
                        $scope.newPermission = 'admin';
                        app.disableUser = false;
                        app.disableModerator = false;
                        app.disableAdmin = true;
                    }
                }, 2000);
            } else {
                console.log('Failed to update user');
                app.errorMsg = data.data.message;
                app.disabled = false;
                $timeout(function() {
                    app.errorMsg = false;
                }, 3000);
            }
        });

    };
});

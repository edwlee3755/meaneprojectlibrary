var User = require('../models/user'); // 1 period means current directory, 2 periods means 1 directory before the current directory
var jwt = require('jsonwebtoken');
var secret = 'edward';

// exports the route to the user
module.exports = function(router) { // need to export so that we can import into our server.js file
  // http://localhost:8080/api/users   . in server.js we added /api to all backend routes so they don't conflict with frontend routes using same url
  // anytime we want to create or enter data into the database, we use post
  router.post('/users', function(req, res){   // USER REGISTRATION ROUTE
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    user.firstName = req.body.firstName;
    user.middleName = req.body.middleName;
    user.lastName = req.body.lastName;
    // run user.save . if theres an err then send err back or if no error send user created

    // if a required field is not provided then we do not reach the save function to save into DB
    if (req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '' || req.body.firstName == null || req.body.firstName == '' || req.body.lastName == null || req.body.lastName == ''){
      res.json({ success: false, message: 'Ensure required fields are provided'});
    }

    else if (req.body.confirmPassword != req.body.password) {
      res.json({ success: false, message: 'Password did not match. Please try again.'});
    }
    else {  // else if required data is provided, then save
      user.save(function(err){
        if (err){

          if (err.errors != null) {    // if input validation error
            // if the name field contains characters which aren't alphabetical characters
            if (err.errors.firstName || err.errors.lastName) {
              res.json({ success: false, message: 'Name fields must be at least 2 characters, maximum of 20 characters, and may only contain alphabetical characters.' });
            }
            else if (err.errors.middleName) {
              res.json({ success: false, message: err.errors.middleName.message });
            }
            else if (err.errors.email) {
              res.json({ success: false, message: err.errors.email.message });
            }
            else if (err.errors.username) {
              res.json({  success: false, message: err.errors.username.message });
            }
            else if (err.errors.password) {
              res.json({  success: false, message: err.errors.password.message });
            }
            else {
              res.json({ success: false, message: err});
            }
          }
          else if (err) {               // else if not a validation error then its a duplication error
            if (err.code = 11000) {     // error code 11000 is duplication
              //res.json({ success: false, message: err.errmsg}); to find the error message so we can count the index to determine if username or email duplicate
              if (err.errmsg[72] == "u") {      // index 72 of the error message is the first letter. If starts with u or e, we know it is a username or email duplicate
                res.json({ success: false, message: 'Username already exists. Please try a different username.' });
              }
              else if (err.errmsg[72] == "e") {
                res.json({ success: false, message: 'Email already exists. Please try a different email.' });
              }

            }
            else {
              res.json({ success: false, message: err });
            }
          }
        }
        else {
          res.json({ success: true, message: 'User has been created.'});
        }
      });
    }
  });

  // USER LOGIN ROUTE
  // http://localhost:port/api/authenticate
  router.post('/authenticate', function(req, res){
    // search database for username field matching the login form username field
    // then select email username password from database
    User.findOne({ username: req.body.username }).select('email username password').exec(function(err, user){
      if (err) throw err;

        if (!user) {
          res.json({ success: false, message: 'Could not authenticate user'});
        }
        else if (user) {
          if (req.body.password && req.body.password !== undefined) { // if req.body.password exists and is not blank
            var validPassword = user.comparePassword(req.body.password);

            if (!validPassword){
              res.json({ success: false, message: 'Could not authenticate password'});
            }
            else {
              // once password is validated, give the user a jwebtoken which maps to the username and email, expires in 24hrs
              var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '30m' });
              res.json({ success: true, message: 'User authenticated', token: token }); // send the token we created to the user
            }
          }
          else {
            res.json({ success: false, message: 'No password provided'});
          }
        }

    });
  });

  // IMPORTANT: define routes that require user to be logged in AFTER the middleware. Routes that do not require user login should be placed ABOVE middleware defined below
  // express middleware to decrpt the json web token and send it back to the user
  router.use(function(req, res, next){  // '.use for express middleware'. 'next' is used for middleware
    var token = req.body.token || req.body.query || req.headers['x-access-token']; // token can be obtained from the request, the URL, or the headers
    if (token) {
      // verify token if there is one retrieved
      jwt.verify(token, secret, function(err, decoded){ // taken from the json web token docs
        if (err) {
          res.json({ success: false, message: 'Token invalid' }); // to catch the case where user had a token but expired after 24hrs, so no longer valid even though they have the token still
        }
        else { // else if token is valid
          req.decoded = decoded;  // takes the token, combines it with the secret we created ('edward') and verifies it. If good. send the token back decoded which contains the username and email which is what we implemented using jwt.sign
          next(); // allows application to continue to router.post('/currentUser') which will grab the decoded token variable
        }
      });
    }
    else {
      res.json({ success: false, message: 'No token provided' });
    }

  });

  router.post('/currentUser', function(req, res) {
    res.send(req.decoded);
  });

  router.get('/renewToken/:username', function(req, res) {
    User.findOne({ username: req.params.username }).select().exec(function(err, user) { // query for username and then execute this function which gives an error or a user
      if (err) {
        throw err;
      }
      if (!user) {
        res.json({ success: false, message: 'No user was found' });
      }
      else {
        //  give the user a jwebtoken which maps to the username and email, expires in 24hrs
        var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '5m' });
        res.json({ success: true, token: newToken }); // send the token we created to the user
      }
    });

  });

  router.get('/permission', function(req, res) {
    User.findOne({ username: req.decoded.username }, function(err, user) {
     if (err) throw err;
     if (!user) {
       res.json({ success: false, message: 'No user was found' });
     }
     else {
       res.json({ success: true, permission: user.permission });
     }
   });
  });

  router.get('/management', function(req, res) {
    User.find({}, function(err, users) {
      if (err) throw err;
      User.findOne({ username: req.decoded.username }, function(err, mainUser) {
        if (err) throw err;
        if (!mainUser) {
          res.json({ success: false, message: 'No user found'});
        }
        else {
          if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
            if (!users) {
              res.json({ success: false, message: 'Users not found' });
            }
            else {
              res.json({ success: true, users: users, permission: mainUser.permission });
            }
          }
          else {
            res.json({ success: false, message: 'Insufficient Permissions' });
          }
        }
      });
    });
  });

  router.delete('/management/:username', function(req, res) {
      var deletedUser = req.params.username;

      // Check if the user requesting to delete has the permissions to delete users
      User.findOne({ username: req.decoded.username }, function(err, mainUser) {
          if (err) throw err;
          if (!mainUser) {
              res.json({ success: false, message: 'No user found' });
          } else {
              if (mainUser.permission !== 'admin') {
                  res.json({ success: false, message: 'Insufficient Permissions'});
              } else {
                  User.findOneAndRemove({ username: deletedUser }, function(err, user) {
                    if (err) throw err;
                    res.json({ success: true });
                  });
              }
          }
      });
  });

  router.get('/editUser/:id', function(req, res) {
      var editUser = req.params.id;
      // Make sure user has appropriate permissions to edit
      User.findOne({ username: req.decoded.username }, function(err, mainUser) {
          if (err) throw err;
          if (!mainUser) {
              res.json({ success: false, message: 'No user found' });
          } else {
              if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {

                  // If user has the permissions, then find the requested user
                  User.findOne({ _id: editUser}, function(err, user) {
                      if (err) throw err;
                      if (!user) {
                          res.json({ success: false, message: 'No user found' });
                      } else {
                          res.json({ success: true, user: user});    // Instead of sending back a message, we're going to send back the requested user
                      }
                  });
              } else {
                  res.json({ success: false, message: 'Insufficient Permissions' });
              }
          }
      });
  });

  router.put('/editUser', function(req, res) {
      var editUser = req.body._id;

      // If firstName* is provided, then set newFirstName = provided firstName
      if (req.body.firstName) var newFirstName = req.body.firstName;
      if (req.body.middleName) var newMiddleName = req.body.middleName;
      if (req.body.lastName) var newLastName = req.body.lastName;
      if (req.body.username) var newUsername = req.body.username;
      if (req.body.email) var newEmail = req.body.email;
      if (req.body.permission) var newPermission = req.body.permission;

      User.findOne({ username: req.decoded.username }, function(err, mainUser) {
          if (err) throw err;
          if (!mainUser) {
              res.json({ success: false, message: 'No user was found' });
          } else {

              // Check if there is there is a new name put in the edit
              if (newFirstName || newMiddleName || newLastName) {
                  console.log('testing print');
                  if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                      User.findOne({ _id: editUser }, function(err, user) {
                          if (err) throw err;
                          if (!user) {
                              res.json({ success: false, message: 'No user was found' });
                          } else {
                              user.firstName = newFirstName;
                              user.middleName = newMiddleName;
                              user.lastName = newLastName;
                              user.save(function(err) {
                                  if (err) {
                                      console.log(err);
                                  } else {
                                      res.json({ success: true, message: 'User has been updated!' });
                                  }

                              });
                          }
                      });
                  } else {
                      res.json({ success: false, message: 'Insufficient Permissions' });
                  }
              }

              if (newUsername) {
                  if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                      User.findOne({ _id: editUser }, function(err, user) {
                          if (err) throw err;
                          if (!user) {
                              res.json({ success: false, message: 'No user was found' });
                          } else {
                              // Once user has permissions and user we want to edit has been in the database, set the user.username value to the newUsername
                              user.username = newUsername;
                              // Save changes to the database
                              user.save(function(err) {
                                  if (err) {
                                      res.json({ success: false, message: 'Username already exists. Please try a different username.' });
                                  } else {
                                      res.json({ success: true, message: 'Username has been updated!' });
                                  }
                              });
                          }
                      });
                  } else {
                      res.json({ success: false, message: 'Insufficient Permissions' });
                  }
              }
              if (newEmail) {
                  if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                      User.findOne({ _id: editUser }, function(err, user) {
                          if (err) throw err;
                          if (!user) {
                              res.json({ success: false, message: 'No user was found' });
                          } else {
                              // Once user has permissions and user we want to edit has been in the database, set the user.email value to the newEmail
                              user.email = newEmail;
                              // Save changes to the database
                              user.save(function(err) {
                                  if (err) {
                                      res.json({ success: false, message: 'Email already exists. Please try a different email.' });
                                  } else {
                                      res.json({ success: true, message: 'Email has been updated!' });
                                  }
                              });
                          }
                      });
                  } else {
                      res.json({ success: false, message: 'Insufficient Permissions' });
                  }
              }
              if (newPermission) {
                  if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                      User.findOne({ _id: editUser }, function(err, user) {
                          if (err) throw err;
                          if (!user) {
                              res.json({ success: false, message: 'No user was found' });
                          } else {
                              // Once user has permissions and user we want to edit has been in the database
                              // If current user is trying to set someone to have only user permissions
                              if (newPermission === 'user') {
                                  // check if the user being editted is an Admin. Only admins may set another admin to a user
                                  if (user.permission === 'admin') {    // If the user being editted is an admin
                                      if (mainUser.permission !== 'admin') {    // Check if the current user is an admin themself
                                          res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin user.' });
                                      } else {    // Else if they ARE an Admin
                                          user.permission = newPermission;  // then they are allowed so save changes
                                          user.save(function(err) {
                                              if (err) {  // check if saving went okay
                                                  console.log(err);
                                              } else {
                                                  res.json({ success: true, message: 'Permissions have been updated!' });
                                              }
                                          });
                                      }
                                  } else {  // If user was not an admin, then they must be a monderator (only moderators or admin can edit)
                                      // Here we know that moderators can edit other moderators to "user" permissions and they can also edit regular users to have only "user" permissions so we don't need checks
                                      user.permission = newPermission;
                                      user.save(function(err) {
                                          if (err) {
                                              console.log(err);
                                          } else {
                                              res.json({ success: true, message: 'Permissions have been updated!' });
                                          }
                                      });
                                  }
                              }
                              // Check if current user is trying to set someone to a moderator
                              if (newPermission === 'moderator') {
                                  if (user.permission === 'admin') {          // If current user is trying to edit someone who is an admin DOWNGRADE to a moderator
                                      if (mainUser.permission !== 'admin') {  // If current user is not an admin
                                          res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin user.' });
                                      } else {  // Else if they ARE an Admin
                                          user.permission = newPermission;
                                          user.save(function(err) {
                                              if (err) {  // check if saving went okay
                                                  console.log(err);
                                              } else {
                                                  res.json({ success: true, message: 'Permissions have been updated!' });
                                              }
                                          });
                                      }
                                  } else {    // Else if current user is editting someone who is not an admin, we don't need to check since hierarcy = admin > moderator > user.
                                      user.permission = newPermission;
                                      user.save(function(err) {
                                          if (err) {  // check if saving went okay
                                              console.log(err);
                                          } else {
                                              res.json({ success: true, message: 'Permissions have been updated!' });
                                          }
                                      });
                                  }
                              }
                              // Check if current user is trying to set someone to become an admin
                              if (newPermission === 'admin') {
                                  if (mainUser.permission === 'admin') {  // Current user must be an admin to set someone to have admin permissions
                                      user.permission = newPermission;
                                      user.save(function(err) {
                                          if (err) {  // check if saving went okay
                                              console.log(err);
                                          } else {
                                              res.json({ success: true, message: 'Permissions have been updated!' });
                                          }
                                      });
                                  } else {  // If current user is not an admin
                                      res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade another user to admin level.'})
                                  }
                              }
                          }
                      });
                  } else {
                      res.json({ success: false, message: 'Insufficient Permissions' });
                  }
              }
          }
      });
  });

  return router;
}

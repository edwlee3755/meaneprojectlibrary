var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [     // field must have specific inputs only a-z , A-Z
  validate({
    validator: 'matches',
    arguments: /^([a-zA-Z]{2,20})+$/
  })
];

var middleNameValidator = [     // field must have specific inputs only a-z , A-Z
  validate({
    validator: 'matches',
    arguments: /^([a-zA-Z]{0,35})+$/,
    message: 'Middle Name may only contain alphabetical characters and must be under 35 characters'
  })
];

var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'The email entered was not a valid email. Please try again.'
  }),
  validate({
    validator: 'isLength',
    arguments: [6, 35],
    message: 'Email must be between {ARGS[0]} and {[ARGS[1]} characters]'
  })
];

var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 35],
    message: 'Username must be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'Username may only contain letters and numbers'
  })
];

var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 35],
    message: 'Password must be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

//create user object schema
var UserSchema = new Schema({
  username: { type: String, required: true, unique: true, validate: usernameValidator },
  password: { type: String, required: true, select: false, validate: passwordValidator },
  email: { type: String, required: true, lowercase: true, unique: true, validate: emailValidator },
  firstName: { type: String, required: true, validate: nameValidator },
  middleName: { type: String, validate: middleNameValidator },
  lastName: { type: String, required: true, validate: nameValidator },
  permission: {type: String, required: true, default: 'user'}

});

//middleware pre save. before saving schema, do this
UserSchema.pre('save', function(next){
  var user = this; //assign user to "this" so it applies to the specific user running thorugh this middleware

  if (!user.isModified('password')) {
      return next();    // If password was not modified or is new, ignore this part of the middleware
  }

  // Function to encrypt password
  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) return next(err);
    user.password = hash;     // Assign the hash to the user's password to be saved into the database
    next();         // Exit bcrypt function
  });
});


UserSchema.plugin(titlize, {
  paths: [ 'firstName', 'middleName', 'lastName' ], // Array of paths
  trim: true
});

UserSchema.methods.comparePassword = function(password){
  // use bcrypt to compare the password provided by the user, to the password hash.
  return bcrypt.compareSync(password, this.password); // bcrypt.compareSync(user password, hash);
};


//export the model. will save to database under collection 'User'
module.exports = mongoose.model('User', UserSchema);

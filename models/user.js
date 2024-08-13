var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var UserSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    favoriteBook: {
      type: String,
      required: false,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    saleseman: {
        type: Boolean,
        default: false
    },
    managerOf: {
        type: String,
        default: ""
    },
    charge: Array,
    courseName: Array,
    chapterName: Array,
    Gmail: String,
    googleId: String,
    // email: String
});
// authenticate input against database documents
UserSchema.statics.authenticate = async function(email, password, callback) {
  try {
    const user = await User.findOne({ email: email }).exec();
    if (!user) {
      var err = new Error('User not found.');
      err.status = 401;
      return callback(err);
    }
    bcrypt.compare(password, user.password, function(error, result) {
      if (result === true) {
        return callback(null, user);
      } else {
        return callback();
      }
    });
  } catch (error) {
    return callback(error);
  }
}
// hash password before saving to database
UserSchema.pre('save', function(next) {
  var user = this;
  if (user.password){
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  } else {
    next();
  }
  
});
var User = mongoose.model('User', UserSchema);
module.exports = User;

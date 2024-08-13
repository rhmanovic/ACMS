var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var TeacherSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    coursesId: Array,
    charge: Array
});


// hash password before saving to database
TeacherSchema.pre('save', function(next) {
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

var Teacher = mongoose.model('teacher', TeacherSchema);
module.exports = Teacher;

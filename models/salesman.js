var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var SalesmanSchema = new mongoose.Schema({
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
    // coursesId: Array,
    // charge: Array
});


// hash password before saving to database
SalesmanSchema.pre('save', function(next) {
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

var Salesman = mongoose.model('salesman', SalesmanSchema);
module.exports = Salesman;

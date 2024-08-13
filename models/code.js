var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var CodeSchema = new mongoose.Schema({
  brandNo: Number,
  name: String,
  status: {
        type: String,
        default: "A"
  } ,
});

var Code = mongoose.model('code', CodeSchema);
module.exports = Code;

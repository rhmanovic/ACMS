var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var VendorSchema = new mongoose.Schema({
    vendorNo: Number,
    name: String
});

var Vendor = mongoose.model('vendor', VendorSchema);
module.exports = Vendor;

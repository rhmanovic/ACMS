var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var WarehouseSchema = new mongoose.Schema({
    name: String
});

var Warehouse = mongoose.model('warehouse', WarehouseSchema);
module.exports = Warehouse;
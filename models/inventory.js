var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var InventorySchema = new mongoose.Schema({
    
    productID: {
      type: String,
      default: "",
      text: true,
    },
    VendorItemNo: {
      type: String,
      default: "",
      text: true,
    },
  
    producturl: {
      type: String,
      default: "",
      text: true,
    },
    nameA: {
      type: String,
      default: "",
      text: true,
    },
    nameE: {
      type: String,
      default: "",
      text: true,
    },
    productNo: {
      type: String,
      default: "",
      text: true,
    },
    brand: {
      type: String,
      default: "",
      text: true,
    },
    productNameA: {
      type: String,
      default: "",
    },
    productNameE: {
      type: String,
      default: "",
    },
    quantityShop: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    quantitywarehouse01: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    minShop: {
      type: Number,
      default: 0,
    },
    sellcount: {
      type: Number,
      default: 0,
    },
    procurecount: {
      type: Number,
      default: 0,
    },
    private: {
      type: Boolean,
      default: false,
    },
    vendormobile: {
      type: String,
      default: "",
    },
    
    warranty: {
      type: String,
      default: "-",
    },
});

var Inventory = mongoose.model('inventory', InventorySchema);
module.exports = Inventory;
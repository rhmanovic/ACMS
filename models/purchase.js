var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var PurchaseSchema = new mongoose.Schema({
  purchaseNo: Number,




  inventoryQuantities: [{
    type: Number,
    default: 0
  }],
  // inventoryCosts: [{
  //   type: Number,
  //   default: 0
  // }],
  // inventoryPrices: [{
  //   type: Number,
  //   default: 0
  // }],

  nameAs: [{
    type: String,
    default: ""
  }],
  nameEs: [{
    type: String,
    default: ""
  }],
  productNos: [{
    type: String,
    default: ""
  }],
  productIDs: [{
    type: String,
    ref: ''
  }],
  brands: [{
    type: String,
    default: ""
  }],
  warranties: [{
    type: String,
    default: "-"
  }],
  productNameAs: [{
    type: String,
    default: ""
  }],
  productNameEs: [{
    type: String,
    default: ""
  }],
  prices: [{
    type: Number,
    default: 0
  }],
  // prices: [{
  //   type: Number,
  //   default: 0
  // }],
  inventoryIDs: [{
    type: String,
    ref: ''
  }],



  // orderNo: Number,
  img: String,
  knetimg: String,
  receiptimg: String,
  // payment_method: String,
  // KentStatus: String,
  // KentStatusBackEnd: String,
  // paymentLog: Object,
  // warehouse: String,
  vendorID: {
    type: String,
    default: ""
  },
  vendorName: {
    type: String,
    default: ""
  },
  // email: {
  //   type: String,
  //   default: "-"
  // },
  userID: String, 


  // productIDs: Array,
  // quantity: Array,
  // variation: Array,
  // warranty: Array,
  // warehouseNo: Array,
  // price: Array,
  // cost: Array,
  // productNames: Array,
  // CustomerID : String,
  // customerName: {
  //   type: String,
  //   default: "-"
  // },

  totalPrice: {
    type: String,
    default: 0
  },
  // totalCost: {
  //   type: Number,
  //   default: 0
  // },
  // mobile: {
  //   type: String,
  //   default: "-"
  // },
  // address: {
  //   type: String,
  //   default: "-"
  // },
  // ID_CITY: String,
  // shippingCost: {
  //   type: Number,
  //   default: 0
  // },
  discount: {
    type: Number,
    default: 0
  },

  invoice: {
    type: String,
    default: ""
  },

  // city: String,
  note: String,
  status: {
    type: String,
    default: "processing"
  },
  group: {
    type: Boolean,
    default: false,
  },
  receivingStatus: {
    type: String,
    default: "processing", // "received", "processing", "returned"
  },
  receivingDate: {
    type: Date,
    default: null,
  },
  receivingName: {
    type: String,
    default: "",
  },
  paymentStatus: {
    type: Boolean,
    default: false,
  },
  paymentDate: {
      type: Date,
      default: null
  },
  paymentName: {
      type: String,
      default: ""
  },
  payment_method: {
      type: String,
      default: "" // "cash", "credit"
  },
  // charge : String, 
  // InternalChgId : String, 
  // this will create date automaticaly so I can qurey by date.
  time: { type: Date, default: Date.now },
  
});

var Purchase = mongoose.model('purchase', PurchaseSchema);
module.exports = Purchase;

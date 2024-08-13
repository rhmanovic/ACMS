var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var TransferRequestSchema = new mongoose.Schema({
    requestNo: {
      type: Number,
      default: 0
    },
    status : {
        type: String,
        default: "processing"
    },
    from: String,
    to: String,

    url: {
      type: String,
      default: "",
    },
    
    


    inventoryID: {
      type: String,
      default: "",
      text: true,
    },
    productID: {
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


  
    quantity: {
      type: Number,
      default: 0
    },
    requestBy: {
        type: String,
        default: "-"
    },
    approvedBy: {
        type: String,
        default: "-"
    },
    shopApprove: {
        type: Boolean,
        default: false
    },
    managerApprove : {
        type: Boolean,
        default: false
    },
    time : { type : Date, default: () => new Date(new Date().getTime() + (3 * 60 * 60 * 1000)) },
    
    approveDate: {
        type: Date,
        default: null
    },
});
 
var TransferRequest = mongoose.model('transferRequest', TransferRequestSchema);
module.exports = TransferRequest;

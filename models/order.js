var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Counter Schema to keep track of the last number used for order IDs
var OrderCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

var OrderCounter = mongoose.model('OrderCounter', OrderCounterSchema);

var OrderSchema = new mongoose.Schema({
  order_number: { type: Number },
  customerName: { type: String },
  myWebsite: { type: String },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      product_name_en: { type: String },
      product_name_ar: { type: String },
      variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      variantName: { type: String },
      v_name_en: { type: String },
      v_name_ar: { type: String },
      v_warranty: { type: String },
      warranty: { type: String },
      brandName: { type: String },
      productImage: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      note: { type: String }
    }
  ],
  address: { type: String },
  phone: { type: String, default: "0" },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payedAmount: { type: Number, default: 0 }, // New field to track the amount paid
  status: { type: String, enum: ['new', 'processing', 'completed', 'canceled', 'returned'], default: 'new' },
  PaymentMethod: { type: String, default: 'cash' },
  // PaymentMethod: { type: String, enum: ['knet', 'cash', 'credit', 'none', 'mixed', 'visa', 'link'], default: 'cash' },
  PaymenStatus: { type: String, enum: ['paid', 'notpaid'], default: 'notpaid' },
  chargeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charge' }, // New field to link the Charge ID
  time: { type: Date, default: Date.now }
});


// Pre-save middleware to auto-increment the order_number only on creation
OrderSchema.pre('save', async function(next) {
  if (this.isNew) { // Check if the document is new
    var doc = this;
    var counterId = `orderNumber_${doc.merchant}`;
    try {
      var cnt = await OrderCounter.findOneAndUpdate({ _id: counterId }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      doc.order_number = cnt.seq;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next(); // If not new, just continue to save without incrementing
  }
});

var Order = mongoose.model('Order', OrderSchema);
module.exports = Order;

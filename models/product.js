var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

// Counter Schema to keep track of the last number used for product IDs
var CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

var Counter = mongoose.model('Counter', CounterSchema);

// Variation Schema as a sub-document
var VariationSchema = new mongoose.Schema({
  v_name_ar: { type: String, required: true },
  v_name_en: { type: String, required: true },
  v_sale_price: { type: Number, required: true },
  v_purchase_price: { type: Number },
  v_available_quantity: { type: Number , default: 0 },
  v_warehouse_stock: { type: Number, default: 0 }, // Added warehouse stock field
  v_barcode: { type: String },
  v_purchase_limit: { type: Number, default: null },
  v_brand: { type: String, default: '' },  // Added brand name field
  v_warranty: { type: String, default: '' } // Added warranty field
});

// Main Product Schema
var ProductSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  product_number: { type: Number }, // field for the unique product number
  category_number: { type: Number }, // field for the unique product number
  product_name_en: { type: String, required: true },
  product_name_ar: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: String, default: '' }, // Added brand name field
  warranty: { type: String, default: '' }, // Added warranty field
  order_command: { type: Number, default: 0 },
  weight: { type: String, default: 0 },
  keywords: { type: String, default: '' },
  product_image: { type: String, default: '' },
  youtube_video_id: { type: String, default: '' },
  description_ar: { type: String, default: '' },
  description_en: { type: String, default: '' },
  sale_price: { type: Number },
  purchase_price: { type: Number },
  purchase_limit: { type: Number, default: null },
  barcode: { type: String, default: '' },
  pdt_discount_type: { type: String, enum: ['percentage', 'quantity', 'nodiscount'] },
  pdt_discount: { type: Number, min: 0, max: 99 },
  variations: [VariationSchema],
  Stock: { type: Number, default: 0 },
  warehouse_stock: { type: Number, default: 0 },
  options: { type: Boolean, default: false }, // Example boolean field
  status: {
    type: Boolean,
    required: true,
    default: true // Automatically sets status to true unless specified otherwise
  },
  product_type: { type: String, enum: ['Simple', 'Complex'] , default: 'Simple'},
});

// Pre-save middleware to auto-increment the product_number only on creation
ProductSchema.pre('save', async function(next) {
  if (this.isNew) { // Check if the document is new
    var doc = this;
    var counterId = `productNumber_${doc.merchant}`;
    try {
      var cnt = await Counter.findOneAndUpdate({ _id: counterId }, { $inc: { seq: 1 } }, { new: true, upsert: true });
      doc.product_number = cnt.seq;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next(); // If not new, just continue to save without incrementing
  }
});

var Product = mongoose.model("product", ProductSchema);
module.exports = Product;

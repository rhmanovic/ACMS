const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const CustomerCounter = mongoose.model('CustomerCounter', CustomerCounterSchema);

const addressSchema = new mongoose.Schema({
  country: { type: String, required: true },
  region: { type: String, required: true },
  addressType: { type: String, required: true },
  street: { type: String, required: true },
  block: { type: String, required: true },
  house: { type: String, required: true },
  district: { type: String },
    avenue: { type: String },
  road: { type: String },
  extraDescription: { type: String },
  isDefault: { type: Boolean, default: false }
});

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  customer_number: {
    type: String,
    unique: true
  },
  country: { type: String, required: true },
  addedDate: { type: Date, default: Date.now },
  balance: { type: Number, default: 0 },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  type: {
    type: String,
    default: "customer",
    enum: ['customer', 'VIP']
  },
  addresses: [addressSchema]
});

customerSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counterId = 'customer_number';
    try {
      const cnt = await CustomerCounter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.customer_number = cnt.seq;
    } catch (error) {
      return next(error);
    }
  }

  next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

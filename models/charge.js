const mongoose = require('mongoose');

const ChargeSchema = new mongoose.Schema({
  charge_id: { type: String, required: true },
  status: { type: String, required: true },
  live_mode: { type: Boolean },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  customer: {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    phone: {
      country_code: { type: String },
      number: { type: String }
    }
  },
  metadata: {
    udf1: { type: String },
    udf2: { type: String },
    myWebsite: { type: String },
    merchant: { type: String },
    order_number: { type: String }
  },
  transaction: {
    authorization_id: { type: String },
    created_at: { type: String }, // This field will store the transaction created time
    amount: { type: Number },
    currency: { type: String }
  },
  reference: {
    track: { type: String },
    payment: { type: String },
    transaction: { type: String }
  },
  response: {
    code: { type: String },
    message: { type: String }
  },
  acquirer_response: {
    code: { type: String },
    message: { type: String }
  },
  gateway_response: {
    code: { type: String },
    message: { type: String }
  },
  receipt: {
    id: { type: String },
    email: { type: Boolean },
    sms: { type: Boolean }
  },
  merchant_id: { type: String }, // New field for Merchant ID
  payment_method: { type: String }, // New field for Payment Method
  created_at: { type: Date, default: Date.now }
});

const Charge = mongoose.model('Charge', ChargeSchema);

module.exports = Charge;
// merchant modal

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const merchantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectName: { type: String, required: true },
  phoneNumber: { type: String, required: true},
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  tapSettings: {
    liveAuthorization: { type: String, default: '' },
    testAuthorization: { type: String, default: '' },
    status: { type: Boolean, default: false },  // Added to store the status of the payment gateway (enabled/disabled)
    mode: { type: String, enum: ['live', 'test'], default: 'test' }
  }
});

// Hash password before saving the document
merchantSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;

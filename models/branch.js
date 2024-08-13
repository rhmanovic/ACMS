const mongoose = require('mongoose');

// Define the schema for the CounterBranch used only in this file
const CounterBranchSchema = new mongoose.Schema({
  _id: { type: String},  // The name of the counterBranch
  seq: { type: Number, default: 0 }       // The current count
});

// Create a model for CounterBranch
const CounterBranch = mongoose.model('CounterBranch', CounterBranchSchema);

// Define the schema for Working Hours
const workingHourSchema = new mongoose.Schema({
  day: { type: String},
  openHour: { type: String},
  closeHour: { type: String},
  breakStart: { type: String, optional: true },
  breakEnd: { type: String, optional: true },
});

// Define the schema for Branch
const branchSchema = new mongoose.Schema({
  branch_number: { type: Number },  // This will be auto-incremented
  branch_name_ar: { type: String, required: true },
  branch_name_en: { type: String, required: true },
  addressAr: { type: String},
  addressEn: { type: String},
  phone: { type: String},
  email: { type: String},
  status: { type: Boolean, default: true },
  isBusy: { type: Boolean, default: false },
  deliveryAvailable: { type: Boolean, default: false },
  pickupAvailable: { type: Boolean, default: false },
  scheduleAvailable: { type: Boolean, default: false },
  latitude: { type: Number },
  longitude: { type: Number },
  workingHours: [workingHourSchema],
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
});

// Initialize working hours for each day of the week with all times set to "00:00"
branchSchema.pre('validate', function (next) {
  if (this.isNew && this.workingHours.length === 0) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.workingHours = days.map(day => ({
      day: day,
      openHour: '00:00',
      closeHour: '00:00',
      breakStart: '00:00',
      breakEnd: '00:00'
    }));
  }
  next();
});

// Pre-save middleware to auto-increment the branch_number only on creation
branchSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counterBranchId = 'branch_number';  // Unique ID for branch counterBranch
    try {
      const cnt = await CounterBranch.findOneAndUpdate(
        { _id: counterBranchId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.branch_number = cnt.seq;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

// Create the Branch model
const Branch = mongoose.model('branch', branchSchema);

module.exports = Branch;

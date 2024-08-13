// Category Model

const mongoose = require("mongoose");
const slugify = require('slugify');

// Define CategoryCounter Schema
const CategoryCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Unique identifier for the counter
  seq: { type: Number, default: 0 }       // Sequence number
});

// Create the CategoryCounter model
const CategoryCounter = mongoose.model('CategoryCounter', CategoryCounterSchema);

// Define the schema for a category
const categorySchema = new mongoose.Schema({
  category_number: { type: Number }, // This will be auto-incremented
  ArabicName: { type: String, required: true },
  EnglishName: {
    type: String,
    required: true,   
  },
  imgsrc: { type: String }, // URL or path to the image
  status: { type: Boolean, default: true },
  categoryLink: { type: String, unique: true }, // URL or routing path for the category
  merchant: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference another document
    ref: 'Merchant', // Reference the Merchant model
    required: true
  },
  discountPerc: { type: Number, default: 0 }, // Default discount percentage
  sort: { type: Number, default: 0 } // Default sort value
});

// Pre-save hook to generate unique categoryLink and auto-increment category_number
categorySchema.pre('save', async function(next) {
  if (this.isNew) {
    const counterId = 'category_number'; // ID for this counter
    try {
      const cnt = await CategoryCounter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.category_number = cnt.seq;
    } catch (error) {
      return next(error);
    }
  }

  // Generate or update categoryLink
  if (this.EnglishName && (this.isNew || this.isModified('EnglishName'))) {
    const baseLink = slugify(this.EnglishName, { lower: true, remove: /[*+~.()'"!:@]/g });
    let uniqueLink = baseLink;
    let count = 1;
    while (await this.constructor.exists({ categoryLink: uniqueLink })) {
      uniqueLink = `${baseLink}-${count}`;
      count++;
    }
    this.categoryLink = uniqueLink;
  }

  next();
});



// Create and export the Category model
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

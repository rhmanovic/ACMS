var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var ChapterSchema = new mongoose.Schema({
    name: String,
    // sections: Array,
    sectionsLinks: Array,
    // user: String,
    courseID: String,
    courseName: String,
    description: String,
    order: Number,
    vendor: String,
    price: Number,
    priceBeforDiscount: Number,
    status: String, 
    showInHomePage: String, 
    showInDiscountPanel: String, 
});

var Chapter = mongoose.model('chapter', ChapterSchema);
module.exports = Chapter;

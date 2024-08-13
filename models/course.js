var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var CourseSchema = new mongoose.Schema({
    parent: String,
    name: String,
    img: String,
    chapters: Array,
    chaptersLinks: Array,
    subCategory: Array,
    // subCategoryLinks: Array
    showInHomePage: String
});

var Course = mongoose.model('course', CourseSchema);
module.exports = Course;

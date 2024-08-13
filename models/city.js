var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var CitySchema = new mongoose.Schema({
    cityArabic: Array,
    cityEnglish: Array,
    ID_CITY: Array,
    cost: Array,
    price: Array,
    shippingFrom: Array
});

var City = mongoose.model('city', CitySchema);
module.exports = City;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: String,
    googleId: String,
    thumbnail: String,
    Gmail: String
});

const User2 = mongoose.model('user23', userSchema);

module.exports = User2; 
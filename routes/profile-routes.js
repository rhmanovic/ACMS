var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Chapter = require('../models/chapter');
var Course = require('../models/course');
var mid = require('../middleware');


// GET /about /safe
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

module.exports = router;

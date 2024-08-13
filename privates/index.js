var Router = require('express').Router();
var express = require('express');
var path = require('path');
var mid = require('../middleware');

// mid.requiresLogin
var app = express();
 
Router.get('/', function(req, res) {
    res.end('All Books !');
});
Router.get('/x', function(req, res) {
    res.end('x');
});


 
Router.get('/upLoads/:id1', function(req, res) {
    const {id1} = req.params;
    // console.log(path.join(__dirname, `../privates/upLoads`, id1))
    res.sendFile(path.join(__dirname, '../privates/upLoads', id1));
});

Router.get('/:id1',mid.requiresSubscription, function(req, res) {
    const {id1} = req.params;
    const {n} = req.query;

    console.log(path.join(__dirname, '../privates', id1,n))
    res.sendFile(path.join(__dirname, '../privates', id1,n));
});
 
module.exports = Router;

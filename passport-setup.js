var express = require('express');
var router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User2 = require('../models/user-model');
const User = require('../models/user');
var Chapter = require('../models/chapter');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
 
passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {

        UserData = {
            name: profile.displayName,
            googleId: profile.id,
            Gmail: profile.emails[0].value
        }

        console.log(profile.id)
        console.log(profile.emails[0].value)
        
        User.findOne({googleId: profile.id}).exec(function (error, currentUser){
            console.log(currentUser)
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                console.log('we try to creat user');
                
                new User({
                    name: profile.displayName,
                    googleId: profile.id,
                    Gmail: profile.emails[0].value,
                    email: makeid(24) + "@randommawadi.com" // we do this becuese every user should have an email or we will fail
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        })
    })
);

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


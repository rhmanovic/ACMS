var User = require('../models/user');
var User = require('../models/merchant');

var path = require('path');
const keys = require('../config/keys');

function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }
  return next();
}

function requiresLogin(req, res, next) {
  if (req.session && req.session.merchant && req.session.merchant.id) {
    return next();
  } else {
    // var err = new Error('You must be logged in to view this page.');
    // err.status = 401;
    // return next(err);
    return res.redirect('/manager/login');
  }
}


function requiresAdmin(req, res, next) {
  if (req.session && req.session.email === keys.admin.Id) {
    return next();
  } else {
    // var err = new Error('You are not Mr. Abdulrahman the Admin');
    // err.status = 401;
    // return next(err);
    var err = new Error('الصفحة مخصصة للمديرين فقط، الرجاء تسجيل الدخول اولا');
    err.status = 401;
    return next(err);
  }

}



function requiresSaleseman(req, res, next) {
  if (req.session && req.session.userId) {

    var userId = req.session.userId


    User.findById(userId).then(user => {
      if (user.saleseman) {
        return next();
      } else if (user.admin){
        return next();
      } else {
        console.log(user);
        var err = new Error('هذه الصفحه فقط لموظفين الشرك');
        err.status = 401;
        return next(err);
      }
    }).catch(error => {
      return next(error);
    });

  
  } else {
    var err = new Error('الرجاء تسجيل الدخول، فقط فريق العمل من يستطيع الدخول لهذه الصفحة');
    err.status = 401;
    return next(err);
  }

}

function requiresSubscription(req, res, next) {
  const {id1} = req.params;
  const {n} = req.query;
  console.log(req.session);


  var userId = req.session.userId

  
  Chapter.findById(id1).exec(function (error, chapter){
    if (error) {
      return next(error);
    } else {
      if (chapter.price > 0){
        if (req.session && userId){
          // not free
          // signed in
          // check if subscribed :)
          User.findById(userId).exec(function (error, user) {
            var subscription = user.subscription
            if (error) {
              return next(error);
            } else {
              function checkSubscription(sub) {
                return sub == chapter._id;
              }        
              var x = subscription.some(checkSubscription);
              if(x){
                // subscribed
                // can see
                return next();
              }else{
                // not subscribed
                // can not see
                res.sendFile(path.join(__dirname, '../privates/upLoads', 'notAllowed.PNG'));
              }
            }
          });
        } else {
          // not free
          // not signed in
          // can not see
          res.sendFile(path.join(__dirname, '../privates/upLoads', 'notAllowed.PNG'));
        }
      } else {
        // free any one can see
        return next();
      }
    }
  });
}



module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
module.exports.requiresAdmin = requiresAdmin;
module.exports.requiresSaleseman = requiresSaleseman;
module.exports.requiresSubscription = requiresSubscription;


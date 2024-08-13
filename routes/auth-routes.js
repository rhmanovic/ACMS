const router = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login', (req, res) => {
  console.log("log in")
  res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', {
  scope: ['profile',"email"]
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
    console.log("done from google, now my buisness")
    // console.log(req)
    console.log(req.user)
    req.session.userId = req.user._id;
    req.session.email = req.user.email;

    // this will make sure that we will redirect after saving session
    req.session.save(function(err) {
        // session saved
        res.redirect('/')
      })
    // res.redirect('/profile');
});

module.exports = router;
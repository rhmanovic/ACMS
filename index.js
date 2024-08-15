const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors'); // Import CORS package
const multer = require('multer');
const path = require('path'); // Make sure to import 'path' module

const mid = require('./middleware');
const keys = require('./config/keys');

const routes = require('./routes/index');
const privates = require('./privates/index');
const routesAdmin = require('./routes/admin/index');
const routesManager = require('./routes/manager/index');
const routesAPI = require('./routes/api/index');
const routesPayment = require('./routes/payment/index');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');

const app = express();


// Enable CORS for all routes
app.use(cors());

// Set view engine
app.set('view engine', 'pug');

// Bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // Redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // Redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // Redirect CSS bootstrap

// Duplicated in app and admin
const storage = multer.diskStorage({
  destination: './privates/index/upLoads',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage
}).single('myFile');

// Establish connection to MongoDB Atlas
mongoose.connect(keys.mongodb.dbURI)
  .then(() => console.log('Successfully connected to MongoDB Atlas.'))
  .catch(err => console.error('Connection to MongoDB Atlas failed:', err));

const db = mongoose.connection;

// Mongo error
db.on('error', console.error.bind(console, 'connection error:'));

app.use(session({
  secret: 'We loves you',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: keys.mongodb.dbURI
  }),
}));

app.use(function(req, res, next) {
  if (req.session.merchant) {
    res.locals.merchantIDNow = req.session.merchant.id;
    res.locals.projectNameNow = req.session.merchant.projectName;
    res.locals.nameNow = req.session.merchant.name;
  } else {
    res.locals.merchantIDNow = null;
    res.locals.projectNameNow = null;
    res.locals.nameNow = null;
  }
  next();
});

// Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from /public
app.use(express.static(__dirname + '/public'));

// Include routes
app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/privates', privates);
app.use('/admin', routesAdmin);
app.use('/manager', routesManager);
app.use('/api', routesAPI);
app.use('/payment', routesPayment);
app.use('/profile', profileRoutes);

app.set('views', __dirname + '/views');
app.set('views/admin', __dirname + '/views/manager');
app.set('views/manager', __dirname + '/views/manager');

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log('Express app listening on port 3000');
});

// Make language.json available in layout.pug
global.language = require('./data/language.json');
global.SiteImages = require('./data/SiteImages.json');
global.theData = require('./data/data.json');

module.exports = app;

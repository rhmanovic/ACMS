// keys.js
// add this file to .gitignore

module.exports = {
  myAPIURL:"gheras.me",
  google: {
    clientID: '390879348958-aafkfja9l2inu4lkhus668gunp9kosos.apps.googleusercontent.com',
    clientSecret: 'oVmsdLuFMI16dBL0ivNOMyf2'
  },
  mongodb: {
    dbURI: 'mongodb+srv://user2023:qEcyyl1kHEO3last@cluster0.k0kof.gcp.mongodb.net/ARABAT?retryWrites=true&w=majority' // Ting
    // dbURI: 'mongodb+srv://user2023:qEcyyl1kHEO3last@cluster0.k0kof.gcp.mongodb.net/Ting?retryWrites=true&w=majority'
  },
  admin: {
    Id: 'eng.dugaim@gmail.com'
  },
  session: {
    cookieKey: 'abdulrahmanawesomeiguess'
  },
  internal: {
    host: 'https://825c4735-d2b1-4621-8633-974fd413651d-00-kmxpy9mi3vzc.spock.replit.dev',
    EmailsForOrders: "eng.dugaim@gmail.com, aziz.dugaim70@gmail.com"
  },
  tapPayment: {
    
    // authorization: "Bearer sk_test_XKokBfNWv6FIYuTMg5sLPjhJ", // public secret test
    authorization: "Bearer sk_test_j3X8W9xhir2ogtVGl0NUYETk", // my secret test
    // authorization: "Bearer sk_live_F7zrQZfAd816O0DTpoean9YM" // my secert production
  },
  
  jwtSecret: 'my_ADD014_jwt_secret_key' // Add your JWT secret key here
};

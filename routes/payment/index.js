const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const keys = require("../../config/keys");

const Merchant = require("../../models/merchant");
const Category = require("../../models/category");
const Product = require("../../models/product");
const Branch = require("../../models/branch");
const Customer = require("../../models/customer");
const Order = require("../../models/order");
const Charge = require("../../models/charge");

const axios = require("axios");







router.get('/dummypaymentrequest', async (req, res) => {
  try {
    const queryParams = new URLSearchParams(paymentData).toString();
    const redirectUrl = `https://59d322bf-18f1-4d6c-9797-dc94e895b38d-00-2inylagzh6ntt.pike.replit.dev/payment?${queryParams}`;

    res.redirect(redirectUrl);
  } catch (error) {
    // console.error('Error posting payment data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});












router.get('/', function(req, res, next) {
  // // console.log('Home Page')
  return res.render('payment/pay', { title: 'Home Page', });
});






// router.get('/pay', async function(req, res1, next) {
//   const { orderId } = req.query;
  

//   const myAPIURL = req.headers.host;
  
//   const postURL = "https://" + myAPIURL + '/payment/payPost'
  

//   try {
//     // Fetch the order from the database using the orderId
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res1.status(404).send('Order not found');
//     }

    
//     var amount = order.total;
//     var myWebsite = order.myWebsite;
//     var order_number = order.order_number;
//     var order_Id = orderId;
//     var customer_phone = order.phone;
//     var merchant = order.merchant;
    

//     var redirectURL = "https://" + myAPIURL + '/payment/tapRedirect';
    
    
//     payforThis();

//   } catch (error) {
//     return res1.status(500).send('Error fetching order');
//   }

//   function payforThis() {
//     var request = require("request");

//     var http = require("https");
//     var options = {
//       "method": "POST",
//       "hostname": "api.tap.company",
//       "port": null,
//       "path": "/v2/charges",
//       "headers": {
//         "authorization": keys.tapPayment.authorization,
//         "content-type": "application/json"
//       }
//     };

//     var req = http.request(options, function(res) {
//       var chunks = [];

//       res.on("data", function(chunk) {
//         chunks.push(chunk);
//       });

//       res.on("end", function() {
//         var body = Buffer.concat(chunks);
//         var profile = JSON.parse(body);
//         transactionUrl = profile.transaction.url;
//         res1.status(200).json({ redirectUrl: transactionUrl });
//       });
//     });

//     req.write(JSON.stringify({
//       amount: amount,
//       currency: 'KWD',
//       threeDSecure: true,
//       save_card: false,
//       description: 'Test Description',
//       statement_descriptor: 'Sample',
//       metadata: { udf1: 'test 1', udf2: 'test 2', myWebsite: myWebsite, order_number: order_number, order_Id: order_Id, customer_phone: customer_phone, merchant: merchant },
//       reference: { transaction: 'txn_0001', order:"000" },
//       receipt: { email: false, sms: true },
//       customer: {
//         first_name: 'test',
//         middle_name: 'test',
//         last_name: 'test',
//         email: 'test@test.com',
//         phone: { country_code: '965', number: customer_phone }
//       },
//       merchant: { id: '' },
//       source: { id: 'src_kw.knet' },
//       post: { url:postURL },
//       redirect: { url:redirectURL }
//     }));
//     req.end();
//   }
// });





router.get('/pay', async function(req, res1, next) {
  const { orderId } = req.query;
  const myAPIURL = req.headers.host;
  const postURL = "https://" + myAPIURL + '/payment/payPost';

  try {
    console.log("Fetching order with ID:", orderId);

    // Fetch the order from the database using the orderId
    const order = await Order.findById(orderId);
    if (!order) {
      console.log("Order not found");
      return res1.status(404).send('Order not found');
    }
    console.log("Order found:", order);

    // Fetch the merchant ID from the order
    const merchantId = order.merchant;
    console.log("Merchant ID from order:", merchantId);

    // Fetch the merchant data to get the TAP payment authorization key
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      console.log("Merchant not found");
      return res1.status(404).send('Merchant not found');
    }
    console.log("Merchant found:", merchant);

    // Check the mode to decide which authorization key to use
    const tapAuthorization = merchant.tapSettings.mode === 'live'
      ? merchant.tapSettings.liveAuthorization
      : merchant.tapSettings.testAuthorization;

    console.log("TAP Authorization Key:", tapAuthorization);

    var amount = order.total;
    var myWebsite = order.myWebsite;
    var order_number = order.order_number;
    var order_Id = orderId;
    var customer_phone = order.phone;

    var redirectURL = "https://" + myAPIURL + '/payment/tapRedirect';

    // Pass merchantId and tapAuthorization as arguments
    payforThis(tapAuthorization, merchantId);

  } catch (error) {
    console.error('Error processing payment:', error);
    return res1.status(500).send('Error processing payment');
  }

  // Function now accepts tapAuthorization and merchantId as arguments
  function payforThis(tapAuthorization, merchantId) {
    var request = require("request");
    var http = require("https");

    console.log("Preparing request to TAP API with authorization:", tapAuthorization);

    var options = {
      "method": "POST",
      "hostname": "api.tap.company",
      "port": null,
      "path": "/v2/charges",
      "headers": {
        "authorization": tapAuthorization, // Use the selected authorization key
        "content-type": "application/json"
      }
    };

    var req = http.request(options, function(res) {
      var chunks = [];

      res.on("data", function(chunk) {
        chunks.push(chunk);
      });

      res.on("end", function() {
        var body = Buffer.concat(chunks);
        var profile = JSON.parse(body);

        if (profile.transaction && profile.transaction.url) {
          var transactionUrl = profile.transaction.url;
          console.log("Redirecting to transaction URL:", transactionUrl);
          res1.status(200).json({ redirectUrl: transactionUrl });
        } else {
          console.error("Transaction URL not found, redirecting to Google.");
          res1.status(200).json({ redirectUrl: myWebsite });
        }
      });
    });

    req.on("error", function(e) {
      console.error("Error with the TAP API request:", e.message);
      res1.redirect('https://www.google.com'); // Redirect on TAP API request error
    });

    req.write(JSON.stringify({
      amount: amount,
      currency: 'KWD',
      threeDSecure: true,
      save_card: false,
      description: 'Test Description',
      statement_descriptor: 'Sample',
      metadata: { udf1: 'test 1', udf2: 'test 2', myWebsite: myWebsite, order_number: order_number, order_Id: order_Id, customer_phone: customer_phone, merchant: merchantId },
      reference: { transaction: 'txn_0001', order: "000" },
      receipt: { email: false, sms: true },
      customer: {
        first_name: 'test',
        middle_name: 'test',
        last_name: 'test',
        email: 'test@test.com',
        phone: { country_code: '965', number: customer_phone }
      },
      merchant: { id: '' },
      source: { id: 'src_kw.knet' },
      post: { url: postURL },
      redirect: { url: redirectURL }
    }));
    req.end();
  }
});













router.get('/tapRedirect', async function(req, res1, next) {
  // Log all query parameters
  console.log('#################### tapRedirect Query Parameters ########################');
  for (const [key, value] of Object.entries(req.query)) {
    console.log(`${key}: ${value}`);
  }

  const { tap_id } = req.query;

  try {
    // Fetch the charge from the database using tap_id
    const charge = await Charge.findOne({ charge_id: tap_id });
    if (!charge) {
      console.log("Charge not found");
      return res1.status(404).send('Charge not found');
    }
    console.log("Charge found:", charge);

    // Ensure the created_at field is valid
    let createdDate = new Date(charge.created_at);
    if (isNaN(createdDate.getTime())) {
      createdDate = null; // Fallback to null or some default if the date is invalid
    }

    // Extract relevant information from the charge
    const paymentData = {
      id: charge.id,
      order_number: charge.metadata.order_number,
      status: charge.status,
      amount: charge.amount,
      currency: charge.currency,
      created: createdDate ? createdDate.toISOString() : 'Invalid Date',
      payment: charge.reference.payment
    };

    console.log("Payment Data:", paymentData);

    // Create query parameters string for redirection
    const queryParams = new URLSearchParams(paymentData).toString();

    // Construct the full redirect URL with proper encoding
    const redirectUrl = `${charge.metadata.myWebsite}payment?${queryParams}`;
    console.log("Redirecting to:", redirectUrl);

    // Redirect to the website specified in charge.metadata.myWebsite with query parameters
    return res1.redirect(encodeURI(redirectUrl));

  } catch (error) {
    console.error('Error fetching charge from database:', error);
    return res1.status(500).send('Error processing payment');
  }
});



router.get('/tapRedirectOld', function(req, res1, next) {
  // Log all query parameters
  console.log('#################### tapRedirect Query Parameters ########################');
  for (const [key, value] of Object.entries(req.query)) {
    console.log(`${key}: ${value}`);
  }

  const { tap_id } = req.query;

  retrieveCharge();

  function retrieveCharge() {
    var http = require("https");

    var options = {
      "method": "GET",
      "hostname": "api.tap.company",
      "port": null,
      "path": `/v2/charges/${tap_id}`,
      "headers": {
        "authorization": keys.tapPayment.authorization,
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        var profile = JSON.parse(body);

        console.log('#################### body ########################');
        console.log(body.toString());
        console.log('#################### profile ########################');
        console.log(profile);

        const paymentData = {
          id: profile.id,
          order_number: profile.metadata.order_number,
          status: profile.status,
          amount: profile.amount,
          currency: profile.currency,
          created: profile.transaction.created,
          payment: profile.reference.payment
        };

        const queryParams = new URLSearchParams(paymentData).toString();
        const redirectUrl = `${profile.metadata.myWebsite}payment?${queryParams}`;

        return res1.redirect(redirectUrl);
      });
    });

    req.write("{}");
    req.end();
  }
});



const paymentData = {
  id: "chg_TS05A2920241214t6O70308306",
  order_number: "666",
  status: "CAPTURED",
  amount: 5.5,
  currency: "KWD",
  created: "1722687269306",
  payment: "3003241214085728021"
};

// https://0d1631b7-2ce3-431e-af36-c7e4fc0f0954-00-1sp5nem2n8wmo.sisko.replit.dev/payment/dummypaymentrequest

router.get('/dummypaymentrequest', async (req, res) => {
  try {
    const queryParams = new URLSearchParams(paymentData).toString();
    const redirectUrl = `https://59d322bf-18f1-4d6c-9797-dc94e895b38d-00-2inylagzh6ntt.pike.replit.dev/payment?${queryParams}`;

    res.redirect(redirectUrl);
  } catch (error) {
    // console.error('Error posting payment data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});














router.post('/payPost', async function(req, res, next) {
  console.log('payPost');
  console.log("req.body: " + JSON.stringify(req.body, null, 2));

  try {
    // Create and save the new Charge document first
    const newCharge = new Charge({
      charge_id: req.body.id,
      status: req.body.status,
      live_mode: req.body.live_mode,
      amount: req.body.amount,
      currency: req.body.currency,
      customer: req.body.customer,
      metadata: req.body.metadata,
      transaction: {
        authorization_id: req.body.transaction.authorization_id,
        created_at: req.body.transaction.created,
        amount: req.body.transaction.amount,
        currency: req.body.transaction.currency
      },
      reference: req.body.reference,
      response: req.body.response,
      gateway_response: req.body.gateway.response,
      receipt: req.body.receipt,
      merchant_id: req.body.merchant.id,
      payment_method: req.body.source.payment_method
    });

    const savedCharge = await newCharge.save();
    console.log("Charge saved successfully with ID:", savedCharge._id);

    // Extract the order ID from the metadata object
    const orderId = req.body.metadata.order_Id;

    // Find the existing order by _id
    let order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found for _id:", orderId);
      return res.status(404).json({ message: "Order not found, but charge saved." });
    }

    // Log the current order details before updating
    console.log("Order found:", order);

    // Save the actual data to the order
    if (req.body.source && req.body.source.payment_method) {
      order.PaymentMethod = req.body.source.payment_method.toLowerCase();
    }

    // Update the PaymenStatus based on the gateway response
    if (req.body.gateway && req.body.gateway.response) {
      if (req.body.gateway.response.message === 'CAPTURED') {
        order.PaymenStatus = 'paid';
      } else if (['NOT CAPTURED', 'DECLINED'].includes(req.body.gateway.response.message)) {
        order.PaymenStatus = 'notpaid';
      }
    }

    // Update the payedAmount field with the actual amount
    order.payedAmount = req.body.amount;

    // Save the Charge ID in the order
    order.chargeId = savedCharge._id;

    // Save the updated order
    await order.save();
    console.log("Order updated with actual data and linked to charge ID:", savedCharge._id);

    res.status(200).json({ message: "Charge and order updated and saved successfully." });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Failed to save charge and update order.", error: error.message });
  }
});





module.exports = router;
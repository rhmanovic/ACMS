const express = require('express');
const router = express.Router();
const request = require("request");

// Environment variables should be used to handle sensitive data securely.
const token = 'mytokenvalue'; // Make sure to keep your actual token secure
const baseURL = 'https://apitest.myfatoorah.com';

router.get('/', function(req, res) {
    res.redirect('/manager');
});


// Route to initiate payment
router.post('/initiate-payment', (req, res) => {
  const options = {
    method: 'POST',
    url: `${baseURL}/v2/InitiatePayment`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: {
      InvoiceAmount: req.body.InvoiceAmount,
      CurrencyIso: req.body.CurrencyIso
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) {
      console.error('InitiatePayment Error:', error);
      return res.status(500).json({error: 'Internal Server Error'});
    }
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json(body);
    }
    res.json(body); // Sending the response back to the client
  });
});

// Route to execute payment
router.post('/execute-payment', (req, res) => {
  const options = {
    method: 'POST',
    url: `${baseURL}/v2/ExecutePayment`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: req.body, // Pass the entire body received from the client
    json: true
  };

  request(options, function (error, response, body) {
    if (error) {
      console.error('ExecutePayment Error:', error);
      return res.status(500).json({error: 'Internal Server Error'});
    }
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json(body);
    }
    res.json(body); // Redirect or send back the response as needed
  });
});

module.exports = router;
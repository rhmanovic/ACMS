const axios = require('axios');
const keys = require('./config/keys'); // Ensure you have the MyFatoorah API key here

const apiBaseUrl = 'https://api.myfatoorah.com';

async function initiatePayment(invoiceAmount, currency) {
  try {
    const response = await axios.post(`${apiBaseUrl}/v2/InitiatePayment`, {
      InvoiceAmount: invoiceAmount,
      CurrencyIso: currency
    }, {
      headers: {
        'Authorization': `Bearer ${keys.myfatoorahApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('InitiatePayment error:', error.response.data);
    throw error;
  }
}

async function executePayment(paymentMethodId, invoiceValue) {
  try {
    const response = await axios.post(`${apiBaseUrl}/v2/ExecutePayment`, {
      PaymentMethodId: paymentMethodId,
      InvoiceValue: invoiceValue
    }, {
      headers: {
        'Authorization': `Bearer ${keys.myfatoorahApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('ExecutePayment error:', error.response.data);
    throw error;
  }
}

module.exports = {
  initiatePayment,
  executePayment
};

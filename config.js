// config.js
var dotenv = require('dotenv');

// Load variables from .env file
dotenv.config();

const config = {
  stripeTestKey: process.env.STRIPE_TEST_KEY,
  bikeshopBackendUrl : process.env.BIKESHOP_BACKEND_URL
};

module.exports = config;

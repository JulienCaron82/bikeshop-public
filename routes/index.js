var express = require('express');
var router = express.Router();

const { stripeTestKey, bikeshopBackendUrl } = require('../config');

const Stripe = require('stripe');
const stripe = Stripe(stripeTestKey);

// If no bikeshopBackendUrl environment variable is provided, the server is assumed to be on localhost:3000 (http)
const thisBackendUrl = bikeshopBackendUrl || 'http://localhost:3000';

const dataBike = {
  bikes: [
    {name: "BIKO45", price: 679, icon: "bike-1.jpg" },
    {name: "ZOOK47", price: 799, icon: "bike-2.jpg" },
    {name: "KIKO89", price: 839, icon: "bike-3.jpg" },
    {name: "GEWO8", price: 1249, icon: "bike-4.jpg" },
    {name: "KIWIT", price: 899, icon: "bike-5.jpg" },
    {name: "NASAY", price: 1399, icon: "bike-6.jpg" }
  ]
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.dataBasket === undefined) req.session.dataBasket = dfltBasket;
  res.render('index', dataBike);
});

// Default empty basket
var dfltBasket = {
  items: []
}

// GET /basket
router.get('/basket', function(req, res, next) {

  // Initialize basket in session
  if (!req.session.dataBasket) req.session.dataBasket = dfltBasket;

  // Evaluate basket (adds fields to dataBasket)
  req.session.dataBasket = evalBasket(req.session.dataBasket);
  
  // Render basket.ejs
  res.render('basket', { dataBasket: req.session.dataBasket });
});


// POST : update item quantity with sync-qty form from /basket
router.post('/sync-qty-basket', function(req, res, next) {

  // Update item quantity
  req.session.dataBasket.items[req.body.index].qty = parseInt(req.body.qty);

  // Evaluate basket (adds fields to dataBasket)
  req.session.dataBasket = evalBasket(req.session.dataBasket);
  
  // Render basket.ejs
  res.render('basket', { dataBasket: req.session.dataBasket });
});


// POST : add item with Buy button from /shop
router.post('/buy-item-shop', function(req, res, next) {
  
  if (req.body.button == "buyOK") { // Click on BUY button from Store page

    // Find item index in basket
    let basketIndex = req.session.dataBasket.items.findIndex(item => (item.name === req.body.bike));

    // If item is found, add 1 unit to item quantity
    if (basketIndex !== -1) {
      req.session.dataBasket.items[basketIndex].qty += parseInt(req.body.qty);
    } else {
      // Add item in basket with quantity qty (one for single item purchase)

      // Check that item is in the store list
      let bikeIndex = dataBike.bikes.findIndex(item => (item.name === req.body.bike));
      if (bikeIndex !== -1) {
        let item = dataBike.bikes[bikeIndex];
        item.qty = parseInt(req.body.qty);
        req.session.dataBasket.items.push(item);
      }
    }
    
  }

  // Evaluate basket (adds fields to dataBasket)
  req.session.dataBasket = evalBasket(req.session.dataBasket);

  // Render basket.ejs
  res.render('basket', { dataBasket: req.session.dataBasket });
});


// GET : Delete item with trash button from basket
router.get('/del-item-basket', function(req, res, next) {

  // Retrieve item index in basket from query params
  const itemIndex = req.query.index;

  if (req.query.button == "deleteOK") {
    // remove item(s) from array
    req.session.dataBasket.items.splice(itemIndex, 1);
  }

  // Evaluate basket (adds fields to dataBasket)
  req.session.dataBasket = evalBasket(req.session.dataBasket);

  // Render basket.ejs
  res.render('basket', { dataBasket: req.session.dataBasket });
});



// Compute basket information and basket total
function evalBasket(basket) {
  // Clean basket from items with quantity 0
  for (let i=0; i<basket.items.length; i++) { 
    let item = basket.items[i];
    // Prevent negative quantities
    if (item.qty < 0) {
      item.qty = 0;
    }
  }

  // Compute Basket informations
  let totalBasket = 0;
  for (let i=0; i<basket.items.length; i++) {
    let item = basket.items[i];

    item.total = item.qty * item.price; 
    totalBasket += item.total;
  }

  basket.total = totalBasket;

  return basket;
}


// Stripe prices must be in cents
function stripe_unit_amount(price) {
  return price * 100.0;
}


/* POST : checkout to Stripe */
router.post('/create-checkout-session', async (req, res) => {

  // Create basketItems in Stripe format
  let basketitemsInStripeFormat = [];
  req.session.dataBasket?.items.forEach(item => {
    basketitemsInStripeFormat.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name
        },
        unit_amount: stripe_unit_amount(item.price),  // price in cents
      },
      quantity: item.qty
    });
  });

  // Create Stripe session and redirect to Stripe page
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: basketitemsInStripeFormat,
    mode: 'payment',
    success_url: `${thisBackendUrl}/success`,
    cancel_url: `${thisBackendUrl}/cancel`
  });

  res.redirect(303, session.url);
});


// GET : Payment Success
router.get('/success', (req, res) => {

  // Empty session basket
  if (req.session.dataBasket !== undefined) {
    req.session.dataBasket.items = [];
  }

  res.render('success');
});


// GET : Payment Canceled
router.get('/cancel', (req, res) => {
  res.render('cancel');
});


// Export router
module.exports = router;

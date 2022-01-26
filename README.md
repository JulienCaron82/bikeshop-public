# La Capsule - Bikeshop project

![Image](https://res.cloudinary.com/delfhqsem/image/upload/v1643211908/github/bikeshop/bikeshop-1_meyy0x.png)

This is a basic responsive shop using bootstrap (4.6) , Express, the MVC architecture, and the Stripe payment API
* On the / page (shop) the bike items are displayed (image, price, buy button)
* On the /basket page, all the items are displayed with quantity, unit price, group price, and overall amount
* When clicking the Checkout button, user is redirected to Stripe payment page
* After payment, user is redirected to Stripe URL which points to either /cancel (canceled payment) or /success (payment accepted)

How to configure :
* type 'npm ci'
* Stripe payment and redirection require a .env file or environment variables
  * STRIPE_TEST_KEY : mandatory
  * BIKESHOP_BACKEND_URL : if not set, the default URL is http://localhost:3000

How it works :
* Shop page (GET) is filled with shop data and displayed bootstrap container-fluid class. 
* Bikes are displayed in card elements and the cards area has a number of columns depending on page width
  * strictly less than 768pix : 1 element/row
  * greater or equal to 768pix (md) and strictly less than 1200pix (xl) : 2 elements/row
  * greater or equal to 1200pix (xl) : 3 elements/row 

* Backend routes are all in routes/index.js file :
  * GET for the shop and basket pages
  * POST for the Buy, Delete and Checkout buttons

* Basket information is stored in the req.session.dataBasket variable (express-session)

* Checkout redirects to a Stripe payment. Use a Stripe test key and test the behavior with test numbers.  
[Testing your Stripe integration](https://stripe.com/docs/testing)
 

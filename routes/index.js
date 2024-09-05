var express = require('express');
var router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/users');
const Order = require('../models/orders');
const { checkBody } = require('../modules/checkBody');
const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST order confirm */
router.post('/order-confirm', authenticateToken, async (req, res) => {

  console.log('/order-confirm req.body', req.body);
  // check if parameter is missing
  if (!checkBody(req.body.data, ['items', 'deliveryDate', 'deliveryTime', 'deliveryAddress', 'total'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // get user id from accessToken
  console.log('order-confirm', req.user);
  const foundUser = await User.findOne({ email: req.user.email });
  console.log('foundUser', foundUser);
  if(!foundUser) {
    return res.status(401).send('Error: User not found');
  }

  // if all is ok, proceed
  // generate order id (from date, user info and short uid)
  const today = new Date();
  const DD = String(today.getDate()).padStart(2, '0');
  const MM = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const YYYY = today.getFullYear();
  const hh = String(today.getHours()).padStart(2, '0');
  const mm = String(today.getMinutes()).padStart(2, '0');
  const ss = String(today.getSeconds()).padStart(2, '0');
  orderDateTime = YYYY + MM + DD + hh + mm + ss;
  const orderId = orderDateTime+'-'+foundUser.lastName.charAt(0)+foundUser.firstName.charAt(0)+makeid(4);
  // console.log(orderId);
  const orderDate = today;

  const { items, deliveryDate, deliveryTime, deliveryAddress, total } = req.body.data;
  console.log('items', items);
  items.forEach((item, i) => {
    // clean/modify product object to save in orders collection
    // item.product.product_id = item.product._id;
    delete item.product._id;
    delete item.product.__v;
    // remove unnecessary properties from product object
    delete item.product.volumes;
    delete item.product.nutritionalInfo;
    // keep only 1 image (the first for now)
    // TODO keep only the image of the chosen volume option if applicable
    // item.product.image = item.product.images[0].url;
    // delete item.product.images;
  });
  console.log('items 2', items);
    
    
  // deliveryAddress.forEach((deliveryAddressString, i) => {
  //   console.log(deliveryAddressString);
  //   deliveryAddress[i] = JSON.parse(deliveryAddressString);
  // });
      
  const orderData = {
    orderId,
    userId: foundUser._id,
    status: 'Pending payment',
    items,
    orderDate,
    deliveryDate,
    deliveryTime,
    deliveryAddress,
    total,
  };
  
  console.log('orderData', orderData);
  // create new order doc
  const newOrder = new Order(orderData);

  // save new order in db
  newOrder.save().then(newDoc => {
    res.json({ result: true, data: newDoc });
  });


});

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  console.log('/create-checkout-session, req.body', req.body);
  // check if parameter is missing
  if (!checkBody(req.body, ['orderId', 'customer_email', 'items', 'deliveryDate', 'deliveryAddress', 'total'])) {
  res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { orderId, customer_email, items, total, deliveryAddress } = req.body;

  // loop items to create line_items product data
  const line_items = items.map((item, i) => {
      return {
          price_data: {
            currency: 'eur',
            unit_amount: (item.product.price * item.product.options.volume.priceMultiplier) * 100,
            product_data: {
              name: item.product.name,
              images: [
                  // TODO : ajouter url complète de l'image, après avoir déployé le frontend
                  // item.images[0].url
              ],
            },
          },
          // description: item.product.description,
          quantity: item.quantity,
      }
  });

  console.log('line_items', line_items);
  console.log('success_url', `${process.env.FRONTEND_URL}/merci?success=true&orderId=${orderId}`);
  console.log('cancel_url', `${process.env.FRONTEND_URL}/commander?canceled=true`);

  const session = await stripe.checkout.sessions.create({
    customer_email,
    line_items,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/merci?success=true&orderId=${orderId}`,
    cancel_url: `${process.env.FRONTEND_URL}/commander?canceled=true`,
  });

  res.json({result: true, data: session});

});


router.post('/order-success', authenticateToken, async (req, res) => {

  console.log('/order-success req.body', req.body);
  // check if parameter is missing
  if (!checkBody(req.body, ['orderId'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { orderId } = req.body;

  // update order status to 'Paid'
  Order.findOneAndUpdate({ orderId }, { status: 'Paid' })
  .then(data => {
    if(data) {
      // => paramétrer l'envoi d'un mail de confirmation de commande


      // order successfully updated
      res.json({result: true, data });
    } else {
      res.json({ result: false, error: 'Order not found', data });
    }
  });



});

module.exports = router;

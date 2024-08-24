var express = require('express');
var router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');

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


  // check if parameter is missing
  if (!checkBody(req.body, ['products', 'deliveryDate', 'deliveryAddress', 'totalAmount'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // get user id from accessToken
  console.log('order-confirm', req.user);
  const foundUser = await User.findOne({ email: req.user.email });

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

  const { products, deliveryDate, deliveryAddress, totalAmount } = req.body;

  products.forEach((productString, i) => {
    console.log(productString);
    products[i] = JSON.parse(productString);
  });
  

  deliveryAddress.forEach((deliveryAddressString, i) => {
    console.log(deliveryAddressString);
    deliveryAddress[i] = JSON.parse(deliveryAddressString);
  });

  const orderData = {
    orderId,
    userId: userFound._id,
    status: 'Pending payment',
    products,
    deliveryDate,
    deliveryAddress,
    totalAmount,
  };

  // create new order doc
  const newOrder = new User({ orderData });

  // save new user in db
  newOrder.save().then(newDoc => {
    res.json({ result: true, data: newDoc });
  });

  res.json({ result: true, data: { orderId } });

});

module.exports = router;

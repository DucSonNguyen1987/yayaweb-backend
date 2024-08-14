var express = require('express');
var router = express.Router();

require('../models/connection');
const Product = require('../models/products');
const { checkBody } = require('../modules/checkBody');
// const authenticateToken = require('../middleware/authMiddleware');


/* GET product info */
router.get('/product-info/:slug', function(req, res, next) {
  
  // retrieve product from db
  Product.findOne({ productId: req.params.slug }).then(data => {
    if (data === null) {
      res.json({ result: false, error: 'Product not found' });
    } else {
      // send product data
      res.json({ result: true, product: data });
    }
  });

});


router.post('/product-add/', function(req, res, next) {
  
  if (!checkBody(req.body, ['productId', 'name', 'category', 'description', 'price', 'images'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { productId, name, category, description, price, images } = req.body;

  // check if product with same id already exists
  Product.findOne({ id: req.params.slug }).then(data => {
    if (data === null) {
      // create new product doc
      const productData = { productId, name, category, description, price, images };
      const newProduct = new Product(productData);
      
      // save new product in db
      newProduct.save().then(newDoc => {
        res.json({ result: true, data: newDoc });
      });

    } else {
      // product already exists
      res.json({ result: false, error: 'Product not found' });
    }
  });

});

module.exports = router;

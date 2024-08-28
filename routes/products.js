var express = require('express');
var router = express.Router();

require('../models/connection');
const Product = require('../models/products');
const Ingredient = require('../models/ingredients');
const { checkBody } = require('../modules/checkBody');
// const authenticateToken = require('../middleware/authMiddleware');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products); // Sends all products as a JSON response
  } catch (error) {
    console.error("Failed to retrieve products: ", error);
    res.status(500).json({ message: "Failed to retrieve products", error: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
      const categories = await Product.distinct("category");
      res.json(categories);
  } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
});


/* GET product info */
router.get('/product-info/:slug', function(req, res, next) {

  // retrieve product from db
  Product.findOne({ productId: req.params.slug })
  .populate('composition')
  .populate({
    path: 'composition',
    populate: {
      path:  'ingredient',
      model: 'ingredients'
    }
  })
  .then(data => {
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

  const { productId, name, category, description, price, images, composition } = req.body;
  //format composition
  composition.forEach((ingredientString, i) => {
    console.log(ingredientString);
    composition[i] = JSON.parse(ingredientString);
  });
  //format images
  images.forEach((imageObjString, i) => {
    console.log(imageObjString);
    images[i] = JSON.parse(imageObjString);
  });

  console.log('composition', composition, 'images', images);

  // check if product with same id already exists
  Product.findOne({ id: req.params.slug }).then(data => {
    if (data === null) {
      // create new product doc
      const productData = { productId, name, category, description, price, images, composition };
      const newProduct = new Product(productData);
      
      // save new product in db
      newProduct.save().then(newDoc => {
        res.json({ result: true, data: newDoc });
      });

    } else {
      // product already exists
      res.json({ result: false, error: 'Product already exists' });
    }
  });

});




module.exports = router;

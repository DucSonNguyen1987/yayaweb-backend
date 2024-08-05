var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/authMiddleware');


const users = [
  // Liste des utilisateurs avec mots de passe hachés
];

function generateAccessToken(userId) {
  return jwt.sign(userId, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRATION_TIME });
}


/* POST users signup */
router.post('/signup', function(req, res, next) {
  // check if parameter is missing
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { email, password } = req.body;


  // Check if the user has not already been registered
  User.findOne({ email }).then(data => {
    if (data === null) {
      // create hash for new user
      const hash = bcrypt.hashSync(password, 10);

      const token = generateAccessToken({ email });

      // create new user doc
      const newUser = new User({
        email,
        password: hash,
        token
      });

      // save new user in db
      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });

});

/* POST users login */
router.post('/login', async (req, res) => {

  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { email, password } = req.body;

  User.findOne({ email }).then(async (data) => {

    // if user is not found or password doesn't match, return error 401
    if(!data || !(await bcrypt.compare(password, data.password))) {
      return res.status(401).send('Error: Unauthorized');
    }

    const token = generateAccessToken({ email: data.email });

    res.json({ result: true, token });

  });
});


/* GET users protected route (test) */
router.get('/account', authenticateToken, (req, res) => {
  res.json({ message: "Success", user: req.user });
});

module.exports = router;

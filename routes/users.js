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

function generateAccessToken(userData) {
  return jwt.sign(userData, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRATION_TIME });
}

function generateRefreshToken(userData) {
  return jwt.sign(userData, process.env.JWT_SECRET_REFRESH_KEY, { expiresIn: '1y' });
}

/* POST users signup */
router.post('/signup', function(req, res, next) {
  // check if parameter is missing
  if (!checkBody(req.body, ['email', 'password', 'firstName', 'lastName', 'gender'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { email, password, firstName, lastName, gender } = req.body;


  // Check if the user has not already been registered
  User.findOne({ email }).then(data => {
    if (data === null) {
      // create hash for new user
      const hash = bcrypt.hashSync(password, 10);
      const userData = {
        email,
        firstName,
        lastName,
        gender,
      };
      const accesToken = generateAccessToken(userData);
      const refreshToken = generateRefreshToken({ email });

      // create new user doc
      const newUser = new User({
        email,
        password: hash,
        firstName,
        lastName,
        gender,
        accesToken,
        refreshToken
      });

      // save new user in db
      newUser.save().then(newDoc => {
        res.json({ result: true, data: { email, firstName, lastName, gender, accesToken, refreshToken } });
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
    const { firstName, lastName, gender } = data;
    const accessToken = generateAccessToken({ email, firstName, lastName, gender });
    const refreshToken = generateRefreshToken({ email });


    res.json({ result: true, data: { email, firstName, lastName, gender, accesToken, refreshToken } });

  });
});

// POST users refreshToken : re-générer l'accessToken à partir du refreshToken
router.post('/refreshToken', async (req, res) => {

  const authHeader = req.headers.authorization;
  const refreshToken = authHeader && authHeader.split(' ')[1];

  if (!refreshToken) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_KEY, (err, user) => {
    console.log(user);
    if (err) {
      return res.status(401).json({ error: 'Access denied' });
    }

    // Check en base que l'user est toujours existant (ou si on le voulait, on pourrait check qu'il est autorisé à refresh son token)
    User.findOne({ email: user.email }).then(async (data) => {

      // if user is not found or password doesn't match, return error 401
      if(!data) {
        return res.status(401).send('Error: Unauthorized');
      }

      const { firstName, lastName, gender } = data;
      
      delete user.iat;
      delete user.exp;
      const refreshedAccessToken = generateAccessToken({ email, firstName, lastName, gender });
      
      res.send({ accessToken: refreshedAccessToken });
  
    });
  });

});

/* GET users protected route (test) */
router.get('/account', authenticateToken, (req, res) => {
  res.json({ message: "Success", user: req.user });
});

module.exports = router;

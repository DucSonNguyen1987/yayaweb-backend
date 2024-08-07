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
      const accessToken = generateAccessToken(userData);
      const refreshToken = generateRefreshToken({ email });

      // create new user doc
      const newUser = new User({...userData, 
        password: hash,
        accessToken,
        refreshToken
      });

      // save new user in db
      newUser.save().then(newDoc => {
        res.json({ result: true, data: { email, firstName, lastName, gender, accessToken, refreshToken } });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });

});

/* POST users login */
router.post('/login', async (req, res) => {

  // check for parameters
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const { email, password } = req.body;

  // check if user exists
  const foundUser = await User.findOne({ email });

  // if user is not found or password doesn't match, return error 401
  if(!foundUser || !(await bcrypt.compare(password, foundUser.password))) {
    return res.status(401).send('Error: Unauthorized');
  }

  // generate tokens and update user in db
  const { firstName, lastName, gender } = foundUser;
  const accessToken = generateAccessToken({ email, firstName, lastName, gender });
  const refreshToken = generateRefreshToken({ email });
  foundUser.accessToken = accessToken;
  foundUser.refreshToken = refreshToken;
  const result = await foundUser.save();
  // send response with user data
  res.json({ result: true, data: { email, firstName, lastName, gender, accessToken, refreshToken } });

});

// POST users refreshToken : re-générer l'accessToken à partir du refreshToken
router.post('/refreshToken', async (req, res) => {

  // check for refresh token in header
  const authHeader = req.headers.authorization;
  const refreshToken = authHeader && authHeader.split(' ')[1];

  // if no refresh token, return error
  if (!refreshToken) return res.status(401).json({ error: 'Access denied' });

  // verify refresh token is valid
  jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_KEY, async (err, user) => {
    console.log(user);
    if (err) {
      // token is not valid, return error
      return res.status(401).json({ error: 'Access denied' });
    }

    // Check en base que l'user est toujours existant (ou si on le voulait, on pourrait check qu'il est autorisé à refresh son token)
    const foundUser = await User.findOne({ email: user.email });
    
    // if user is not found or password doesn't match, return error 401
    if(!foundUser) {
      return res.status(401).send('Error: Unauthorized');
    }
    console.log('foundUser', foundUser.firstName);
    const { firstName, lastName, gender } = foundUser;
    // remove issued at and expiration
    delete user.iat;
    delete user.exp;
    // generate new access token and update user in db
    const refreshedAccessToken = generateAccessToken({ email: user.email, firstName, lastName, gender });
    foundUser.accessToken = refreshedAccessToken;
    const result = await foundUser.save();
    // send response with 
    res.send({ accessToken: refreshedAccessToken });
    
  
  });

});

/* GET users protected route (test) */
router.get('/account', authenticateToken, (req, res) => {
  res.json({ message: "Success", user: req.user });
});

module.exports = router;

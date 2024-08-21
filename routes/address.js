const express = require('express');
const router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');

// Route to get user address by user ID
router.get('/:id/address', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ address: user.address });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

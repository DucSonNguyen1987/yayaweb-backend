const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ')[1];

    if (!accessToken) return res.status(401).json({ error: 'Access denied' });

    try {
        jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, user) => {
            // console.log(err);
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid access token' });
    }
 };

module.exports = authenticateToken;
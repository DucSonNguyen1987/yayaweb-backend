const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            console.log(err);
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
 };

module.exports = authenticateToken;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'your-jwt-secret'; // In production, use environment variable

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Not authorized to access this route' });
    }
};

// Optional authentication middleware
exports.optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (err) {
            // Invalid token, but we'll continue without user
            req.user = null;
        }
    } else {
        // No token, continue without user
        req.user = null;
    }

    next();
};

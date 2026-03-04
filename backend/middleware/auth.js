const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

exports.protect = async (req, res, next) => {
    console.log('Auth middleware - checking token');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token found:', token ? 'Yes' : 'No');
    }

    if (!token) {
        console.log('No token found');
        return res.status(401).json({ error: 'Not authorized - no token' });
    }

    try {
        // Verify token
        console.log('Verifying token...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token decoded:', decoded);

        const user = await User.findById(decoded.id).select('-password');
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('No user found with token ID');
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        console.log('User attached to request:', req.user._id);
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({
            error: 'Not authorized - token failed',
            details: err.message
        });
    }
};

// Optional authentication middleware
exports.optionalAuth = async (req, res, next) => {
    console.log('Optional auth middleware');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Optional auth - token found');

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            req.user = user;
            console.log('Optional auth - user found:', req.user?._id);
        } catch (err) {
            console.log('Optional auth - token invalid:', err.message);
            req.user = null;
        }
    } else {
        console.log('Optional auth - no token');
        req.user = null;
    }

    next();
};

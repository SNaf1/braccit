const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
});

// Register route
router.post(
    '/register',
    [
        check('username')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        check('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        check('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/\d/)
            .withMessage('Password must contain at least one number')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('Password must contain at least one special character')
    ],
    authController.register
);

// Login route
router.post(
    '/login',
    authLimiter,
    [
        check('username', 'Username is required').trim().not().isEmpty(),
        check('password', 'Password is required').exists()
    ],
    authController.login
);

// Get current user route
router.get('/me', protect, authController.getCurrentUser);

// Update profile route
router.put(
    '/profile',
    protect,
    [
        check('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        check('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        check('bio')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Bio cannot exceed 500 characters')
    ],
    authController.updateProfile
);

// Change password route
router.post(
    '/change-password',
    protect,
    [
        check('currentPassword', 'Current password is required').exists(),
        check('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/\d/)
            .withMessage('Password must contain at least one number')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('Password must contain at least one special character')
    ],
    authController.changePassword
);

// Verify token route
router.get('/verify', protect, (req, res) => {
    res.status(200).json({ valid: true });
});

// Logout route
router.post('/logout', protect, authController.logout);

module.exports = router;

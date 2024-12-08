const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
// const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
// const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@braccit.com';
const NODE_ENV = process.env.NODE_ENV || 'development';

/* Email configuration - Disabled for development
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
*/

// Create JWT Token
const createToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
};

/* Email functions - Disabled for development
const sendVerificationEmail = async (user, verificationToken) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    await transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: 'Verify your Braccit account',
        html: `
            <h1>Welcome to Braccit!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
        `
    });
};

const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: 'Reset your Braccit password',
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the link below to create a new password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    });
};
*/

// Register user
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() }, 
                { username: username.toLowerCase() }
            ] 
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Create new user
        const user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            isEmailVerified: true // Auto-verify for development
        });

        /* Disabled for development
        // Generate verification token
        const verificationToken = user.generateVerificationToken();
        */
        
        await user.save();

        /* Disabled for development
        // Send verification email
        if (NODE_ENV === 'production') {
            await sendVerificationEmail(user, verificationToken);
        }
        */

        // Create token
        const token = createToken(user._id);

        // Remove sensitive data
        user.password = undefined;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, password } = req.body;

        // Get user
        const user = await User.findOne({
            username: username.toLowerCase()
        }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                error: 'Account is temporarily locked. Please try again later.'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            // Increment login attempts
            await user.incrementLoginAttempts();
            
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Create token
        const token = createToken(user._id);

        // Remove sensitive data
        user.password = undefined;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        res.status(200).json({
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Server error while fetching user data' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, email, name, bio } = req.body;
        const updateData = {};

        // Check if username is being updated
        if (username) {
            const existingUser = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: req.user.id }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            updateData.username = username.toLowerCase();
        }

        // Check if email is being updated
        if (email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: req.user.id }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            updateData.email = email.toLowerCase();
            // Email verification disabled for development
            updateData.isEmailVerified = true;
        }

        // Update other fields
        if (name) updateData.name = name;
        if (bio) updateData.bio = bio;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error while updating profile' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const user = await User.findById(req.user.id).select('+password');
        const { currentPassword, newPassword } = req.body;

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error during password change' });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        // In a token-based system, we don't need to do anything server-side
        // The client should remove the token
        res.status(200).json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error during logout' });
    }
};

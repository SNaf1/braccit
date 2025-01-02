const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const EMAIL_FROM = process.env.SMTP_USER || 'sadnan.ornob@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'sadnan.ornob@gmail.com',
        pass: 'sjlotdbabprdbouo'
    },
    debug: true,
    logger: true
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('Transporter verification error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

// Create JWT Token
const createToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
};

const sendVerificationEmail = async (user, verificationToken) => {
    try {
        const verificationUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;
        const mailOptions = {
            from: EMAIL_FROM,
            to: user.email,
            subject: 'Verify your Braccit account',
            html: `
                <h1>Welcome to Braccit!</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
                <p>This link will expire in 24 hours.</p>
            `
        };
        
        console.log('Attempting to send email with options:', { ...mailOptions, to: '***' });
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

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
            isEmailVerified: false
        });

        // Generate and save verification token
        const verificationToken = user.generateVerificationToken();
        console.log('Generated token:', verificationToken);
        console.log('User before save:', {
            email: user.email,
            verificationToken: user.emailVerificationToken,
            isVerified: user.isEmailVerified
        });
        
        await user.save();
        console.log('User after save:', {
            email: user.email,
            verificationToken: user.emailVerificationToken,
            isVerified: user.isEmailVerified
        });

        await sendVerificationEmail(user, verificationToken);

        // Don't create token or return user data
        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account before logging in.',
            requiresVerification: true
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Verifying token:', token);
        
        // Hash the token to match what's stored in the database
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        console.log('Looking for user with hashed token:', hashedToken);

        // First try to find user by token
        let user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        // If no user found with active token, check if the email was already verified
        if (!user) {
            // Try to find a user that was verified with this token
            user = await User.findOne({
                $or: [
                    { emailVerificationToken: hashedToken },
                    { isEmailVerified: true }
                ]
            });

            if (user && user.isEmailVerified) {
                return res.status(200).json({ 
                    message: 'Email is successfully verified. Please proceed to login.',
                    isVerified: true
                });
            }

            return res.status(400).json({ 
                error: 'Invalid or expired verification token. Please request a new verification email if needed.'
            });
        }

        // If we found a user with an active token and they're not verified yet
        if (!user.isEmailVerified) {
            console.log('Updating user verification status:', {
                email: user.email,
                isVerified: true
            });

            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpire = undefined;
            await user.save();

            console.log('User updated successfully:', {
                email: user.email,
                isVerified: user.isEmailVerified,
                verificationToken: user.emailVerificationToken
            });
        }

        res.status(200).json({ 
            message: 'Email verified successfully! You can now log in.',
            isVerified: true
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Server error during email verification' });
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

        // Get user with password but populate joinedCommunities
        const user = await User.findOne({
            username: username.toLowerCase()
        })
        .select('+password')
        .populate('joinedCommunities');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({ 
                error: 'Please verify your email before logging in',
                needsVerification: true 
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = createToken(user._id);

        // Remove sensitive data but keep other fields
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpire;
        delete userResponse.emailVerificationToken;
        delete userResponse.emailVerificationExpire;

        res.status(200).json({
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
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
        console.log('Change password request received:', {
            userId: req.user?.id,
            body: req.body
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({ error: 'User not found' });
        }

        const { oldPassword, newPassword } = req.body;
        console.log('Attempting password match for user:', user.username);

        // Check current password
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            console.log('Password match failed for user:', user.username);
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();
        console.log('Password updated successfully for user:', user.username);

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

const { validationResult } = require('express-validator');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password -loginAttempts -lastLoginAttempt')
            .populate('joinedCommunities', 'name description');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { fullName, bio, email } = req.body;
        const updateData = {};

        if (fullName !== undefined) updateData.fullName = fullName;
        if (bio !== undefined) updateData.bio = bio;
        if (email !== undefined) {
            // Check if email is already in use by another user
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already in use' });
            }
            updateData.email = email;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password -loginAttempts -lastLoginAttempt');

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete old profile picture if it exists and is not the default
        if (user.profilePicture && !user.profilePicture.includes('default-profile.png')) {
            const oldPicturePath = path.join(__dirname, '..', 'uploads', user.profilePicture.replace('/uploads/', ''));
            try {
                await fs.unlink(oldPicturePath);
            } catch (err) {
                console.error('Error deleting old profile picture:', err);
                // Continue execution even if delete fails
            }
        }

        // Update user with new profile picture path
        const profilePicturePath = req.file.filename;
        user.profilePicture = profilePicturePath;
        await user.save();

        const updatedUser = await User.findById(user._id).select('-password');

        res.json({
            message: 'Profile picture updated successfully',
            user: updatedUser,
            profilePicture: `http://localhost:5000/uploads/profile-pictures/${profilePicturePath}`
        });
    } catch (error) {
        console.error('Update profile picture error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

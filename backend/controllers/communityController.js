const Community = require('../models/Community');
const User = require('../models/User');
const Post = require('../models/Post');

// Create a new community
const createCommunity = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.body;
        
        // Check if community already exists
        const existingCommunity = await Community.findOne({ name: name.toLowerCase() });
        if (existingCommunity) {
            return res.status(400).json({ error: 'Community already exists' });
        }

        let bannerImage = null;
        if (req.file) {
            // Save just the filename without the /uploads/ prefix
            bannerImage = req.file.filename.replace('/uploads/', '');
            console.log('Banner image saved:', bannerImage);
        }

        const community = new Community({
            name: name.toLowerCase(),
            description,
            isPrivate: isPrivate === 'true',
            bannerImage,
            owner: req.user._id,
            admins: [req.user._id],
            members: [req.user._id]
        });

        await community.save();
        res.status(201).json(community);
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({ error: 'Error creating community' });
    }
};

// Get community details
const getCommunity = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() })
            .populate('owner', 'username')
            .populate('members', 'username')
            .populate('admins', 'username')
            .populate('pendingMembers', 'username');

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Debug logs
        console.log('Community found:', {
            name: community.name,
            bannerImage: community.bannerImage,
            fullBannerUrl: `/uploads/${community.bannerImage}`
        });

        const response = {
            ...community.toObject(),
            isMember: community.members.some(member => member._id.equals(req.user._id)),
            isAdmin: community.admins.some(admin => admin._id.equals(req.user._id)),
            hasPendingRequest: community.pendingMembers.some(member => member._id.equals(req.user._id))
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({ error: 'Error fetching community' });
    }
};

// Request to join community
const requestJoin = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is already a member
        if (community.members.includes(req.user._id)) {
            return res.status(400).json({ error: 'Already a member' });
        }

        // Check if user is already in pending list
        if (community.pendingMembers.includes(req.user._id)) {
            return res.status(400).json({ error: 'Join request already pending' });
        }

        if (community.isPrivate) {
            // Add to pending members for private communities
            community.pendingMembers.push(req.user._id);
            await community.save();
            res.json({ message: 'Join request sent' });
        } else {
            // Direct join for public communities
            community.members.push(req.user._id);
            await community.save();
            res.json({ message: 'Joined community' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error joining community' });
    }
};

// Approve join request (admin only)
const approveJoinRequest = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin
        if (!community.admins.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { userId } = req.body;
        if (!community.pendingMembers.includes(userId)) {
            return res.status(400).json({ error: 'No pending request from this user' });
        }

        // Remove from pending and add to members
        community.pendingMembers = community.pendingMembers.filter(id => !id.equals(userId));
        community.members.push(userId);
        await community.save();

        res.json({ message: 'User approved' });
    } catch (error) {
        res.status(500).json({ error: 'Error approving request' });
    }
};

// Get all communities (public ones and private ones user is member of)
const getAllCommunities = async (req, res) => {
    try {
        const communities = await Community.find({
            $or: [
                { isPrivate: false },
                { members: req.user?._id }
            ]
        })
        .populate('owner', 'username')
        .sort({ createdAt: -1 });

        res.json(communities);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching communities' });
    }
};

// Add admin (owner only)
const addAdmin = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is owner
        if (!community.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can add admins' });
        }

        const { userId } = req.body;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is member
        if (!community.members.includes(userId)) {
            return res.status(400).json({ error: 'User must be a member first' });
        }

        // Check if already admin
        if (community.admins.includes(userId)) {
            return res.status(400).json({ error: 'User is already an admin' });
        }

        community.admins.push(userId);
        await community.save();

        res.json({ message: 'Admin added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding admin' });
    }
};

// Update community (admin only)
const updateCommunity = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin
        if (!community.admins.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updates = req.body;
        
        // Handle banner image update
        if (req.file) {
            updates.bannerImage = req.file.filename.replace('/uploads/', '');
            console.log('Updated banner image:', updates.bannerImage); // Debug log
        }

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                community[key] = updates[key];
            }
        });

        await community.save();
        res.json(community);
    } catch (error) {
        console.error('Error updating community:', error);
        res.status(500).json({ error: 'Error updating community' });
    }
};

// Search communities
const searchCommunities = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const communities = await Community.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('creator', 'username profilePicture')
        .select('name description members isPrivate tags createdAt')
        .limit(20);

        res.json(communities);
    } catch (error) {
        console.error('Search communities error:', error);
        res.status(500).json({ error: 'Error searching communities' });
    }
};

// Cancel join request
const cancelJoinRequest = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Remove user from pending members
        community.pendingMembers = community.pendingMembers.filter(id => !id.equals(req.user._id));
        await community.save();

        res.json({ message: 'Join request cancelled' });
    } catch (error) {
        res.status(500).json({ error: 'Error cancelling join request' });
    }
};

// Reject join request (admin only)
const rejectJoinRequest = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin
        if (!community.admins.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { userId } = req.body;
        if (!community.pendingMembers.includes(userId)) {
            return res.status(400).json({ error: 'No pending request from this user' });
        }

        // Remove from pending members
        community.pendingMembers = community.pendingMembers.filter(id => !id.equals(userId));
        await community.save();

        res.json({ message: 'Join request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Error rejecting join request' });
    }
};

// Leave community
const leaveCommunity = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is the owner
        if (community.owner.equals(req.user._id)) {
            return res.status(400).json({ error: 'Community owner cannot leave. Transfer ownership first.' });
        }

        // Remove user from members and admins
        community.members = community.members.filter(id => !id.equals(req.user._id));
        community.admins = community.admins.filter(id => !id.equals(req.user._id));
        await community.save();

        res.json({ message: 'Successfully left community' });
    } catch (error) {
        res.status(500).json({ error: 'Error leaving community' });
    }
};

// Remove member (admin only)
const removeMember = async (req, res) => {
    try {
        const community = await Community.findOne({ name: req.params.name.toLowerCase() });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin
        if (!community.admins.some(id => id.equals(req.user._id))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { userId } = req.body;
        
        // Can't remove the owner
        if (community.owner.equals(userId)) {
            return res.status(400).json({ error: 'Cannot remove community owner' });
        }

        // Remove user from members and admins
        community.members = community.members.filter(id => !id.equals(userId));
        community.admins = community.admins.filter(id => !id.equals(userId));
        await community.save();

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Error removing member' });
    }
};

// Get user's communities
const getUserCommunities = async (req, res) => {
    try {
        const communities = await Community.find({
            members: req.user._id
        }).select('name isPrivate memberCount');

        res.json(communities);
    } catch (error) {
        console.error('Error fetching user communities:', error);
        res.status(500).json({ error: 'Error fetching user communities' });
    }
};

module.exports = {
    createCommunity,
    getCommunity,
    requestJoin,
    approveJoinRequest,
    getAllCommunities,
    addAdmin,
    updateCommunity,
    searchCommunities,
    cancelJoinRequest,
    rejectJoinRequest,
    leaveCommunity,
    removeMember,
    getUserCommunities
};

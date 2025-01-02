const Event = require('../models/Event');
const Community = require('../models/Community');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user._id;

        // Check if community exists
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check if user is admin or owner
        const isAdmin = community.admins.includes(userId);
        const isOwner = community.owner.equals(userId);

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Only community admins and owners can create events' });
        }

        const event = new Event({
            ...req.body,
            community: communityId,
            creator: userId
        });

        await event.save();

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get community events
exports.getCommunityEvents = async (req, res) => {
    try {
        const { communityId } = req.params;
        const events = await Event.find({ community: communityId })
            .populate('creator', 'username')
            .populate('going', 'username')
            .sort({ startDate: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get event details
exports.getEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId)
            .populate('creator', 'username')
            .populate('going', 'username')
            .populate('community');
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Add isGoing flag for current user
        const response = event.toObject();
        response.isGoing = event.going.some(user => user._id.toString() === req.user._id.toString());
        
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle going status
exports.toggleGoing = async (req, res) => {
    try {
        const { eventId, communityId } = req.params;
        
        // First check if user is member of the community
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        if (!community.members.includes(req.user._id)) {
            return res.status(403).json({ error: 'You must be a member to attend events' });
        }

        let event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const userIdStr = req.user._id.toString();
        const userIndex = event.going.findIndex(id => id.toString() === userIdStr);
        
        if (userIndex === -1) {
            event.going.push(req.user._id);
        } else {
            event.going.splice(userIndex, 1);
        }

        await event.save();
        
        // Populate the going field before sending response
        event = await Event.findById(eventId)
            .populate('creator', 'username')
            .populate('going', 'username');
        
        // Add isGoing flag for current user
        const response = event.toObject();
        response.isGoing = event.going.some(user => user._id.toString() === userIdStr);
        
        res.json(response);
    } catch (error) {
        console.error('Toggle going error:', error);
        res.status(500).json({ error: error.message });
    }
};
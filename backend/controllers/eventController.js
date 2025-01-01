const Event = require('../models/Event');
const Community = require('../models/Community');

// Create event
const createEvent = async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin or owner to create event
        if (!community.admins.includes(req.user.id) && community.owner !== req.user.id) {
            return res.status(403).json({ error: 'Only admins and owners can create events' });
        }

        const event = new Event({
            ...req.body,
            community: req.params.communityId,
            createdBy: req.user._id
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Error creating event' });
    }
};

// Get community events
const getCommunityEvents = async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId)
            .populate('members', 'username')
            .populate('admins', 'username');

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Allow access if user is a member, admin, or owner
        const isMember = community.members.some(member => member._id.toString() === req.user.id);
        const isAdmin = community.admins.some(admin => admin._id.toString() === req.user.id);
        const isOwner = community.owner.toString() === req.user.id;

        if (!isMember && !isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Access denied: Not a member of the community' });
        }

        const events = await Event.find({ community: req.params.communityId })
            .populate('community', 'name')
            .populate('createdBy', 'username')
            .sort({ startTime: 1 }); // Sort events by start time

        res.json(events);
    } catch (error) {
        console.error('Error fetching community events:', error);
        res.status(500).json({ error: 'Error fetching community events' });
    }
};

// Get event details
const getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId)
            .populate('community', 'name')
            .populate('createdBy', 'username');
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const community = await Community.findById(event.community);
        
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user has access to the event
        const isMember = community.members.includes(req.user.id);
        const isAdmin = community.admins.includes(req.user.id);
        const isOwner = community.owner.toString() === req.user.id;

        if (!isMember && !isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Access denied: Not a member of the community' });
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ error: 'Error fetching event details' });
    }
};

module.exports = {
    createEvent,
    getCommunityEvents,
    getEventDetails,
};
const Event = require('../models/Event');
const Community = require('../models/Community');

const createEvent = async (req, res) => {
    try {
        const { title, description, startTime } = req.body;
        const community = await Community.findById(req.params.communityId);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        if (!community.admins.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const event = new Event({
            title,
            description,
            startTime,
            community: community._id,
            createdBy: req.user._id,
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Error creating event' });
    }
};

const getCommunityEvents = async (req, res) => {
    try {
        const events = await Event.find({ community: req.params.communityId }).sort({ startTime: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
    }
};

module.exports = {
    createEvent,
    getCommunityEvents,
};
const Event = require('../models/Event');

// Get event details
const getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId)
            .populate('community', 'name')
            .populate('createdBy', 'username');
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Assuming you have a way to determine the users who are going to the event
        const going = []; // Replace with actual logic to get users going to the event

        res.json({ ...event.toObject(), going });
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
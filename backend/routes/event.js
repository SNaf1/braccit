const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Community events routes
router.post('/:communityId/events', protect, eventController.createEvent);
router.get('/:communityId/events', protect, eventController.getCommunityEvents);

// Individual event routes
router.get('/events/:eventId', protect, eventController.getEventDetails);
router.post('/events/:eventId/going', protect, eventController.toggleGoing);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const eventController = require('../controllers/eventController');

router.post('/:communityId/events', protect, eventController.createEvent);
router.get('/:communityId/events', protect, eventController.getCommunityEvents);

module.exports = router;
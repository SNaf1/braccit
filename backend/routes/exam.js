const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect } = require('../middleware/auth');

// Routes
router.get('/search', examController.searchExams);
router.get('/all', examController.getAllExams);
router.post('/upload', protect, examController.uploadSchedule, examController.parsePdfAndSave);

module.exports = router;

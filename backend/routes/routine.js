const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const routineController = require('../controllers/routineController');

// Routes
router.get('/', protect, routineController.getRoutine);
router.post('/upload', protect, routineController.uploadRoutine);
router.delete('/:id', protect, routineController.deleteRoutine);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const {
    getCourseSuggestions,
    getAllCourses,
    addCourse,
    updateCompletedCourses,
    updateCurrentCourses
} = require('../controllers/courseController');

// Debug middleware for this router
router.use((req, res, next) => {
    console.log('Course route accessed:', req.method, req.path);
    next();
});

// Get all courses (no auth required)
router.get('/', async (req, res) => {
    console.log('Getting all courses');
    try {
        await getAllCourses(req, res);
    } catch (error) {
        console.error('Error in get all courses route:', error);
        res.status(500).json({ 
            error: 'Internal server error in get all courses',
            details: error.message 
        });
    }
});

// Get course suggestions for the logged-in student
router.get('/suggestions', protect, async (req, res) => {
    console.log('Getting course suggestions for user:', req.user?._id);
    try {
        await getCourseSuggestions(req, res);
    } catch (error) {
        console.error('Error in course suggestions route:', error);
        res.status(500).json({ 
            error: 'Internal server error in course suggestions',
            details: error.message 
        });
    }
});

// Get user's courses
router.get('/my-courses', protect, async (req, res) => {
    console.log('Getting courses for user:', req.user?._id);
    try {
        const user = await User.findById(req.user._id)
            .populate('completedCourses.course')
            .populate('currentCourses');
            
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            completedCourses: user.completedCourses,
            currentCourses: user.currentCourses
        });
    } catch (error) {
        console.error('Error getting user courses:', error);
        res.status(500).json({ 
            error: 'Error getting user courses',
            details: error.message 
        });
    }
});

// Add a new course (admin only)
router.post('/', protect, async (req, res) => {
    console.log('Adding new course:', req.body);
    try {
        await addCourse(req, res);
    } catch (error) {
        console.error('Error in add course route:', error);
        res.status(500).json({ 
            error: 'Internal server error in add course',
            details: error.message 
        });
    }
});

// Update completed courses for a student
router.post('/completed', protect, async (req, res) => {
    console.log('Updating completed courses for user:', req.user?._id);
    try {
        await updateCompletedCourses(req, res);
    } catch (error) {
        console.error('Error in update completed courses route:', error);
        res.status(500).json({ 
            error: 'Internal server error in update completed courses',
            details: error.message 
        });
    }
});

// Update current courses for a student
router.post('/current', protect, async (req, res) => {
    console.log('Updating current courses for user:', req.user?._id);
    try {
        await updateCurrentCourses(req, res);
    } catch (error) {
        console.error('Error in update current courses route:', error);
        res.status(500).json({ 
            error: 'Internal server error in update current courses',
            details: error.message 
        });
    }
});

module.exports = router;

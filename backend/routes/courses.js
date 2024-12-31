const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const {
    getCourseSuggestions,
    getDegreeProgress,
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
        const courses = await Course.find({ isActive: true });
        res.json(courses);
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

// Get degree progress for the logged-in student
router.get('/progress', protect, getDegreeProgress);

// Get user's courses
router.get('/my-courses', protect, async (req, res) => {
    console.log('Getting courses for user:', req.user?._id);
    try {
        const user = await User.findById(req.user._id)
            .populate('completedCourses')
            .populate('currentCourses');
            
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            completedCourses: user.completedCourses || [],
            currentCourses: user.currentCourses || []
        });
    } catch (error) {
        console.error('Error in get user courses route:', error);
        res.status(500).json({ 
            error: 'Internal server error in get user courses',
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
router.put('/completed', protect, updateCompletedCourses);

// Update current courses for a student
router.put('/current', protect, updateCurrentCourses);

module.exports = router;

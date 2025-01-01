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

const axios = require('axios');

// Helper function to parse schedule string into a structured format
const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return [];
    
    return scheduleStr.split(',').map(schedule => {
        const match = schedule.match(/([A-Za-z]+)\((.+)\)/);
        if (!match) return null;
        
        const [_, day, timeRoom] = match;
        const [time, room] = timeRoom.split('-');
        return { day, time, room };
    }).filter(Boolean);
};

// Helper function to normalize course codes
function normalizeCourseCode(code) {
    return code.replace(/\s+/g, '').toUpperCase();
}

// Get all courses (no auth required)
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://usis-cdn.eniamza.com/usisdump.json');
        
        const mappedCourses = response.data.map(course => {
            // Format schedules
            const formatSchedules = (scheduleStr) => {
                if (!scheduleStr) return [];
                return scheduleStr.split(',').map(s => s.trim());
            };

            // Get schedules
            const classSchedules = formatSchedules(course.classSchedule);
            const labSchedules = formatSchedules(course.classLabSchedule);

            // Combine all schedules
            const allSchedules = [...classSchedules, ...labSchedules];

            const mappedCourse = {
                code: course.courseCode,
                name: course.courseTitle,
                credits: course.courseCredit,
                description: course.courseDetails,
                instructor: course.empName || course.faculty || '',
                instructorInitials: course.empShortName || '',
                schedules: allSchedules,
                availableSeats: parseInt(course.availableSeat) || 0,
                prerequisites: course.preRequisiteCourses?.trim() || '',
                section: course.section,
                room: course.room,
                department: course.courseCode?.split(' ')[0] || ''
            };

            return mappedCourse;
        });

        res.json(mappedCourses);
    } catch (error) {
        console.error('Error in get all courses route:', error);
        res.status(500).json({ 
            error: 'Failed to fetch courses from USIS API',
            details: error.message 
        });
    }
});

const prerequisites = require('../data/prerequisites');
const { degreePlan, isRequiredCourse } = require('../data/degreePlan');

// Course suggestion routes
router.get('/suggestions', protect, getCourseSuggestions);
router.get('/progress', protect, getDegreeProgress);
router.put('/completed', protect, updateCompletedCourses);
router.put('/current', protect, updateCurrentCourses);

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

// Helper function to determine course category
function getCourseCategory(courseCode) {
    const normalizedCode = normalizeCourseCode(courseCode);
    const categories = degreePlan.categories;
    
    // Check university core categories
    for (const [streamName, stream] of Object.entries(categories.universityCore.streams)) {
        if (stream.required?.some(c => normalizeCourseCode(c) === normalizedCode) || 
            stream.optional?.some(c => normalizeCourseCode(c) === normalizedCode) ||
            stream.foundation?.some(c => normalizeCourseCode(c) === normalizedCode)) {
            return `University Core - ${streamName}`;
        }
    }

    // Check program core
    if (categories.programCore.required?.some(c => normalizeCourseCode(c) === normalizedCode)) {
        return 'Program Core';
    }

    // Check program electives
    if (categories.programElectives.courses?.some(c => normalizeCourseCode(c) === normalizedCode)) {
        return 'Program Elective';
    }

    // Check project/internship/thesis
    if (categories.projectInternshipThesis.required?.some(c => normalizeCourseCode(c) === normalizedCode)) {
        return 'Project/Internship/Thesis';
    }

    return 'Other';
}

module.exports = router;

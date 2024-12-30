const Course = require('../models/Course');
const User = require('../models/User');

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        console.log('Fetching all courses...');
        const courses = await Course.find({})
            .sort({ code: 1 }); // Sort by course code
        console.log(`Found ${courses.length} courses`);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ 
            error: 'Failed to fetch courses',
            details: error.message 
        });
    }
};

// Get course suggestions for a student
const getCourseSuggestions = async (req, res) => {
    console.log('Getting course suggestions for user:', req.user?._id);
    
    try {
        if (!req.user) {
            console.log('No user found in request');
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await User.findById(req.user._id);
        console.log('Found user:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all active courses
        const allCourses = await Course.find({ isActive: true });
        
        // Get completed course codes
        const completedCourseCodes = user.completedCourses || [];
        const currentCourseCodes = user.currentCourses || [];
        
        console.log('Completed courses:', completedCourseCodes);
        console.log('Current courses:', currentCourseCodes);

        // Filter courses
        const suggestedCourses = allCourses.filter(course => {
            // Skip if course is completed or currently taking
            if (completedCourseCodes.includes(course.code) || 
                currentCourseCodes.includes(course.code)) {
                return false;
            }

            // Check prerequisites
            if (!course.prerequisites || course.prerequisites.length === 0) {
                return true; // No prerequisites needed
            }

            // Check if all prerequisites are completed
            return course.prerequisites.every(prereq => 
                completedCourseCodes.includes(prereq)
            );
        });

        console.log(`Found ${suggestedCourses.length} suggested courses`);
        res.json(suggestedCourses);

    } catch (error) {
        console.error('Error getting course suggestions:', error);
        res.status(500).json({ 
            error: 'Failed to get course suggestions',
            details: error.message 
        });
    }
};

// Add a new course
const addCourse = async (req, res) => {
    try {
        const courseData = req.body;
        console.log('Adding new course:', courseData);

        const course = new Course(courseData);
        await course.save();

        console.log('Course added successfully:', course.code);
        res.status(201).json(course);
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ 
            error: 'Failed to add course',
            details: error.message 
        });
    }
};

// Update student's completed courses
const updateCompletedCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { completedCourses } = req.body;
        console.log('Updating completed courses for user:', req.user._id);
        console.log('New completed courses:', completedCourses);

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { completedCourses },
            { new: true }
        );

        console.log('Updated user completed courses');
        res.json(user);
    } catch (error) {
        console.error('Error updating completed courses:', error);
        res.status(500).json({ 
            error: 'Failed to update completed courses',
            details: error.message 
        });
    }
};

// Update student's current courses
const updateCurrentCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { currentCourses } = req.body;
        console.log('Updating current courses for user:', req.user._id);
        console.log('New current courses:', currentCourses);

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { currentCourses },
            { new: true }
        );

        console.log('Updated user current courses');
        res.json(user);
    } catch (error) {
        console.error('Error updating current courses:', error);
        res.status(500).json({ 
            error: 'Failed to update current courses',
            details: error.message 
        });
    }
};

module.exports = {
    getAllCourses,
    getCourseSuggestions,
    addCourse,
    updateCompletedCourses,
    updateCurrentCourses
};

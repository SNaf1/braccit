const Course = require('../models/Course');
const User = require('../models/User');

// Get course suggestions for a student
exports.getCourseSuggestions = async (req, res) => {
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
        console.log('Found active courses:', allCourses.length);
        
        // Get completed course codes
        const completedCourseCodes = (user.completedCourses || []).map(cc => 
            typeof cc.course === 'string' ? cc.course : cc.course?.code
        ).filter(Boolean);
        
        const currentCourseCodes = (user.currentCourses || []).map(c => 
            typeof c === 'string' ? c : c?.code
        ).filter(Boolean);

        console.log('Completed courses:', completedCourseCodes);
        console.log('Current courses:', currentCourseCodes);

        // Filter courses that the student can take
        const suggestions = allCourses.filter(course => {
            // Skip if already completed or currently taking
            if (completedCourseCodes.includes(course.code) || 
                currentCourseCodes.includes(course.code)) {
                return false;
            }

            // Check if all prerequisites are met
            const prereqsMet = !course.prerequisites || course.prerequisites.every(prereq => 
                completedCourseCodes.includes(prereq)
            );

            return prereqsMet;
        });

        console.log('Generated suggestions:', suggestions.length);

        // Sort suggestions by semester to recommend courses in proper order
        suggestions.sort((a, b) => a.semester - b.semester);

        res.json(suggestions);
    } catch (error) {
        console.error('Error in getCourseSuggestions:', error);
        res.status(500).json({ 
            error: 'Error getting course suggestions',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    console.log('getAllCourses called');
    try {
        // Get all courses, including inactive ones
        const courses = await Course.find({})
            .select('code name description credits prerequisites semester department isActive')
            .sort({ semester: 1, code: 1 });
        
        console.log('Found courses:', courses.length);
        
        if (!courses.length) {
            // If no courses exist, let's create some sample courses
            const sampleCourses = [
                {
                    code: 'CSE101',
                    name: 'Introduction to Programming',
                    description: 'Basic programming concepts using Python',
                    credits: 3,
                    prerequisites: [],
                    semester: 1,
                    department: 'Computer Science',
                    isActive: true
                },
                {
                    code: 'CSE102',
                    name: 'Object Oriented Programming',
                    description: 'OOP concepts using Java',
                    credits: 3,
                    prerequisites: ['CSE101'],
                    semester: 2,
                    department: 'Computer Science',
                    isActive: true
                },
                {
                    code: 'MATH101',
                    name: 'Calculus I',
                    description: 'Introduction to calculus',
                    credits: 3,
                    prerequisites: [],
                    semester: 1,
                    department: 'Mathematics',
                    isActive: true
                },
                {
                    code: 'MATH102',
                    name: 'Calculus II',
                    description: 'Advanced calculus concepts',
                    credits: 3,
                    prerequisites: ['MATH101'],
                    semester: 2,
                    department: 'Mathematics',
                    isActive: true
                },
                {
                    code: 'CSE201',
                    name: 'Data Structures',
                    description: 'Fundamental data structures and algorithms',
                    credits: 3,
                    prerequisites: ['CSE102'],
                    semester: 3,
                    department: 'Computer Science',
                    isActive: true
                },
                {
                    code: 'CSE202',
                    name: 'Database Systems',
                    description: 'Database design and SQL',
                    credits: 3,
                    prerequisites: ['CSE102'],
                    semester: 3,
                    department: 'Computer Science',
                    isActive: true
                }
            ];

            console.log('Creating sample courses...');
            await Course.insertMany(sampleCourses);
            console.log('Sample courses created');
            
            // Return the newly created courses
            res.json(sampleCourses);
        } else {
            res.json(courses);
        }
    } catch (error) {
        console.error('Error in getAllCourses:', error);
        res.status(500).json({ 
            error: 'Error getting courses',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Add a new course
exports.addCourse = async (req, res) => {
    try {
        const { code, name, description, credits, prerequisites, semester, department } = req.body;

        // Validate prerequisites exist
        if (prerequisites && prerequisites.length > 0) {
            const prereqCourses = await Course.find({ code: { $in: prerequisites } });
            if (prereqCourses.length !== prerequisites.length) {
                return res.status(400).json({ error: 'One or more prerequisites do not exist' });
            }
        }

        const course = new Course({
            code,
            name,
            description,
            credits,
            prerequisites,
            semester,
            department
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ 
            error: 'Error adding course',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Update student's completed courses
exports.updateCompletedCourses = async (req, res) => {
    try {
        const { courseCode, grade } = req.body;

        // Verify course exists
        const course = await Course.findOne({ code: courseCode });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const user = await User.findById(req.user.id);
        
        // Remove from current courses if present
        user.currentCourses = user.currentCourses.filter(code => code !== courseCode);
        
        // Add to completed courses
        user.completedCourses.push({
            course: courseCode,
            grade,
            completedAt: new Date()
        });

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating completed courses:', error);
        res.status(500).json({ 
            error: 'Error updating completed courses',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Update student's current courses
exports.updateCurrentCourses = async (req, res) => {
    try {
        const { courseCodes } = req.body;

        // Verify all courses exist
        const courses = await Course.find({ code: { $in: courseCodes } });
        if (courses.length !== courseCodes.length) {
            return res.status(400).json({ error: 'One or more courses do not exist' });
        }

        const user = await User.findById(req.user.id);
        user.currentCourses = courseCodes;
        await user.save();
        
        res.json(user);
    } catch (error) {
        console.error('Error updating current courses:', error);
        res.status(500).json({ 
            error: 'Error updating current courses',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    getCourseSuggestions,
    getAllCourses,
    addCourse,
    updateCompletedCourses,
    updateCurrentCourses
};

const Course = require('../models/Course');
const User = require('../models/User');
const { prerequisites, courseLoadRules, courseTypes } = require('../data/prerequisites');
const { trackDegreeProgress, suggestGenEdElectives } = require('../utils/degreeProgress');
const { degreePlan } = require('../data/degreePlan');

// Helper function to check if prerequisites are met
const checkPrerequisites = (course, completedCourses) => {
    const coursePrereqs = prerequisites[course.code];
    if (!coursePrereqs) return true;

    return coursePrereqs.hardPrereqs.every(prereq => 
        completedCourses.includes(prereq)
    );
};

// Helper function to get maximum allowed courses based on CGPA
const getMaxCourses = (cgpa) => {
    if (cgpa >= courseLoadRules.maximum.minCGPA) {
        return courseLoadRules.maximum.maxCourses;
    } else if (cgpa >= courseLoadRules.extended.minCGPA) {
        return courseLoadRules.extended.maxCourses;
    }
    return courseLoadRules.regular.maxCourses;
};

// Get first semester courses
const getFirstSemesterCourses = () => {
    return Object.entries(prerequisites)
        .filter(([_, info]) => info.semester === 1)
        .map(([code]) => code);
};

// Get course suggestions
const getCourseSuggestions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await User.findById(req.user._id)
            .populate('completedCourses')
            .populate('currentCourses');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get completed and current courses
        const completedCourses = (user.completedCourses || []).map(course => course.code);
        const currentCourses = (user.currentCourses || []).map(course => course.code);
        const totalCompletedCredits = (user.completedCourses || []).reduce((sum, course) => sum + (course.credits || 0), 0);

        // Determine current semester based on completed credits
        const currentSemester = Math.floor(totalCompletedCredits / 15) + 1;

        // Get all active courses
        const allCourses = await Course.find({ isActive: true });

        // Calculate max courses based on CGPA
        const maxCourses = getMaxCourses(user.cgpa || 0);
        const currentCourseCount = currentCourses.length;

        // Get first semester courses if no courses completed
        let suggestedCourses;
        if (completedCourses.length === 0 && currentCourses.length === 0) {
            // Get first semester course codes
            const firstSemesterCourseCodes = getFirstSemesterCourses();
            console.log('First semester course codes:', firstSemesterCourseCodes);

            // Get course details for first semester courses
            suggestedCourses = allCourses
                .filter(course => firstSemesterCourseCodes.includes(course.code))
                .map(course => ({
                    ...course.toObject(),
                    type: prerequisites[course.code]?.type || 'Unknown',
                    semester: 1
                }))
                .slice(0, maxCourses);

            console.log('Suggested courses for first semester:', suggestedCourses);
        } else {
            // Filter and sort courses for next semester
            const nextSemester = currentSemester;
            suggestedCourses = allCourses
                .filter(course => {
                    // Skip completed or current courses
                    if (completedCourses.includes(course.code) || 
                        currentCourses.includes(course.code)) {
                        return false;
                    }

                    // Check prerequisites
                    return checkPrerequisites(course, completedCourses);
                })
                .map(course => ({
                    ...course.toObject(),
                    type: prerequisites[course.code]?.type || 'Unknown',
                    semester: prerequisites[course.code]?.semester || 0
                }))
                .sort((a, b) => {
                    // Sort by semester first
                    if (a.semester !== b.semester) {
                        return a.semester - b.semester;
                    }

                    // Then prioritize required courses
                    if (a.isRequired !== b.isRequired) {
                        return b.isRequired - a.isRequired;
                    }

                    // Then prioritize by course type
                    const typeOrder = {
                        [courseTypes.PROGRAM_CORE]: 1,
                        [courseTypes.SCHOOL_CORE]: 2,
                        [courseTypes.GEN_ED]: 3,
                        [courseTypes.PROGRAM_ELECTIVE]: 4,
                        [courseTypes.THESIS]: 5,
                        'Unknown': 6
                    };
                    return typeOrder[a.type] - typeOrder[b.type];
                })
                .slice(0, maxCourses - currentCourseCount);
        }

        res.json({
            currentStatus: {
                cgpa: user.cgpa || 0,
                currentCourseCount,
                maxCourses,
                canTakeMore: currentCourseCount < maxCourses,
                currentSemester,
                totalCredits: totalCompletedCredits
            },
            suggestedCourses
        });

    } catch (error) {
        console.error('Error in getCourseSuggestions:', error);
        res.status(500).json({ 
            error: 'Failed to get course suggestions',
            details: error.message
        });
    }
};

// Get degree progress
const getDegreeProgress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await User.findById(req.user._id)
            .populate('completedCourses')
            .populate('currentCourses');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const completedCourses = user.completedCourses || [];
        const progress = trackDegreeProgress(completedCourses);

        res.json(progress);
    } catch (error) {
        console.error('Error in getDegreeProgress:', error);
        res.status(500).json({ 
            error: 'Failed to get degree progress',
            details: error.message
        });
    }
};

// Update completed courses with validation
const updateCompletedCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { completedCourses } = req.body;
        if (!Array.isArray(completedCourses)) {
            return res.status(400).json({ error: 'Invalid completedCourses format' });
        }

        // Validate all courses exist
        const courses = await Course.find({ code: { $in: completedCourses } });
        if (courses.length !== completedCourses.length) {
            return res.status(400).json({ error: 'One or more courses not found' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { completedCourses: courses.map(course => course._id) },
            { new: true }
        );

        res.json({ message: 'Completed courses updated successfully' });
    } catch (error) {
        console.error('Error in updateCompletedCourses:', error);
        res.status(500).json({ 
            error: 'Failed to update completed courses',
            details: error.message
        });
    }
};

// Update current courses with validation
const updateCurrentCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { currentCourses } = req.body;
        if (!Array.isArray(currentCourses)) {
            return res.status(400).json({ error: 'Invalid currentCourses format' });
        }

        // Get user with populated courses
        const user = await User.findById(req.user._id)
            .populate('completedCourses')
            .populate('currentCourses');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate all courses exist
        const courses = await Course.find({ code: { $in: currentCourses } });
        if (courses.length !== currentCourses.length) {
            return res.status(400).json({ error: 'One or more courses not found' });
        }

        // Check maximum course limit
        const maxCourses = getMaxCourses(user.cgpa || 0);
        if (currentCourses.length > maxCourses) {
            return res.status(400).json({ 
                error: 'Maximum course limit exceeded',
                maxCourses
            });
        }

        // Update user's current courses
        user.currentCourses = courses.map(course => course._id);
        await user.save();

        res.json({ message: 'Current courses updated successfully' });
    } catch (error) {
        console.error('Error in updateCurrentCourses:', error);
        res.status(500).json({ 
            error: 'Failed to update current courses',
            details: error.message
        });
    }
};

module.exports = {
    getCourseSuggestions,
    getDegreeProgress,
    updateCompletedCourses,
    updateCurrentCourses
};

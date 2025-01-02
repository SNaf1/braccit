const Course = require('../models/Course');
const User = require('../models/User');
const StudentCourse = require('../models/studentCourse');
const { prerequisites, courseTypes } = require('../data/prerequisites');
const { degreePlan, isRequiredCourse, getCourseCredits } = require('../data/degreePlan');

// Helper function to check if prerequisites are met
const checkPrerequisites = (courseCode, completedCourses) => {
    const coursePrereqs = prerequisites[courseCode];
    if (!coursePrereqs) return true;

    // Check hard prerequisites
    const hardPrereqsMet = coursePrereqs.hardPrereqs.every(prereq => 
        completedCourses.includes(prereq)
    );

    // Check soft prerequisites
    const softPrereqsMet = coursePrereqs.softPrereqs.length === 0 || 
        coursePrereqs.softPrereqs.some(prereq => completedCourses.includes(prereq));

    return hardPrereqsMet && softPrereqsMet;
};

// Helper function to get course load options based on CGPA
const getCourseLoadOptions = (cgpa) => {
    if (cgpa >= 3.8) {
        return {
            minCourses: 4,
            maxCourses: 5,
            suggestBoth: true
        };
    }
    if (cgpa >= 3.5) {
        return {
            minCourses: 4,
            maxCourses: 4,
            suggestBoth: false
        };
    }
    if (cgpa >= 3.0) {
        return {
            minCourses: 3,
            maxCourses: 4,
            suggestBoth: true
        };
    }
    return {
        minCourses: 3,
        maxCourses: 3,
        suggestBoth: false
    };
};

// Helper function to track degree progress
const trackDegreeProgress = (completedCourses) => {
    const progress = {
        totalCredits: {
            completed: 0,
            required: degreePlan.totalCreditsRequired,
            remaining: degreePlan.totalCreditsRequired
        },
        universityCore: {
            totalCredits: {
                completed: 0,
                required: degreePlan.categories.universityCore.totalCredits,
                remaining: degreePlan.categories.universityCore.totalCredits
            },
            streams: {}
        },
        schoolCore: {
            totalCredits: {
                completed: 0,
                required: degreePlan.categories.schoolCore.totalCredits,
                remaining: degreePlan.categories.schoolCore.totalCredits
            },
            courses: []
        },
        programCore: {
            totalCredits: {
                completed: 0,
                required: degreePlan.categories.programCore.totalCredits,
                remaining: degreePlan.categories.programCore.totalCredits
            },
            courses: []
        },
        isOnTrack: true
    };

    // Initialize university core streams
    Object.entries(degreePlan.categories.universityCore.streams).forEach(([streamName, info]) => {
        const totalCredits = Object.values(info.credits || {}).reduce((sum, credit) => sum + credit, 0);
        progress.universityCore.streams[streamName] = {
            completed: [],
            remaining: [...(info.required || []), ...(info.optional || [])],
            required: info.required || [],
            optional: info.optional || [],
            optionalCompleted: [],
            credits: {
                completed: 0,
                required: totalCredits,
                remaining: totalCredits
            }
        };
    });

    // Track completed courses
    completedCourses.forEach(course => {
        const courseCode = course.code;
        const credits = getCourseCredits(courseCode);
        
        // Update total credits
        progress.totalCredits.completed += credits;
        progress.totalCredits.remaining = Math.max(0, progress.totalCredits.required - progress.totalCredits.completed);

        // Check university core courses
        let foundInUniversityCore = false;
        Object.entries(degreePlan.categories.universityCore.streams).forEach(([streamName, info]) => {
            const stream = progress.universityCore.streams[streamName];
            
            if ((info.required && info.required.includes(courseCode)) || 
                (info.optional && info.optional.includes(courseCode))) {
                stream.completed.push({
                    code: courseCode,
                    name: course.name,
                    credits: credits,
                    type: info.required && info.required.includes(courseCode) ? 'Required' : 'Optional'
                });
                // Remove from remaining courses
                stream.remaining = stream.remaining.filter(code => code !== courseCode);
                
                // Track optional courses separately
                if (info.optional && info.optional.includes(courseCode)) {
                    stream.optionalCompleted.push(courseCode);
                }

                stream.credits.completed += credits;
                stream.credits.remaining = Math.max(0, stream.credits.required - stream.credits.completed);
                
                progress.universityCore.totalCredits.completed += credits;
                progress.universityCore.totalCredits.remaining = Math.max(0, 
                    progress.universityCore.totalCredits.required - progress.universityCore.totalCredits.completed);
                
                foundInUniversityCore = true;
            }
        });

        // Check school core courses
        if (!foundInUniversityCore && degreePlan.categories.schoolCore.required.includes(courseCode)) {
            progress.schoolCore.courses.push({
                code: courseCode,
                name: course.name,
                credits: credits,
                type: 'Required'
            });
            progress.schoolCore.totalCredits.completed += credits;
            progress.schoolCore.totalCredits.remaining = Math.max(0, 
                progress.schoolCore.totalCredits.required - progress.schoolCore.totalCredits.completed);
        }

        // Check program core courses
        const isProgramCore = degreePlan.categories.programCore.courses.some(c => c.code === courseCode);
        if (!foundInUniversityCore && isProgramCore) {
            progress.programCore.courses.push({
                code: courseCode,
                name: course.name,
                credits: credits,
                type: 'Required'
            });
            progress.programCore.totalCredits.completed += credits;
            progress.programCore.totalCredits.remaining = Math.max(0, 
                progress.programCore.totalCredits.required - progress.programCore.totalCredits.completed);
        }
    });

    // Check if on track
    progress.isOnTrack = (
        progress.totalCredits.completed >= progress.totalCredits.required * 0.25 && // At least 25% complete
        progress.universityCore.totalCredits.completed >= progress.universityCore.totalCredits.required * 0.3 && // At least 30% of university core
        progress.programCore.totalCredits.completed >= progress.programCore.totalCredits.required * 0.2 // At least 20% of program core
    );

    return progress;
};

// Get course suggestions
const getCourseSuggestions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Get student's course history
        const studentCourses = await StudentCourse.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        // Get all completed courses
        const completedCourses = studentCourses.reduce((acc, semester) => {
            return [...acc, ...semester.courseCodes];
        }, []);

        console.log('Completed courses:', completedCourses);

        // Get latest CGPA and calculate current semester
        const latestCGPA = studentCourses.length > 0 ? studentCourses[0].cgpa : 0;
        const currentSemester = studentCourses.length > 0 ? studentCourses.length + 1 : 1;

        console.log('Current semester:', currentSemester);
        console.log('CGPA:', latestCGPA);

        // Special handling for third semester
        if (currentSemester === 3) {
            const thirdSemesterCourses = ['BNG103', 'EMB101', 'ENG102', 'HUM103'];
            const remainingCourses = thirdSemesterCourses.filter(code => !completedCourses.includes(code));
            
            console.log('Third semester remaining courses:', remainingCourses);

            // Map courses to their full details
            const allCourses = await Course.find({ code: { $in: remainingCourses } });
            const coursesWithDetails = allCourses.map(course => {
                const courseInfo = prerequisites[course.code];
                return {
                    ...course.toObject(),
                    type: courseInfo.type || 'Unknown',
                    semester: courseInfo.semester,
                    isRequired: isRequiredCourse(course.code),
                    prerequisites: courseInfo.hardPrereqs,
                    softPrerequisites: courseInfo.softPrereqs
                };
            });

            // Return only third semester courses
            return res.json({
                currentStatus: {
                    cgpa: latestCGPA,
                    currentSemester,
                    completedCourses: completedCourses.length,
                    totalCreditsCompleted: completedCourses.length * 3,
                    totalEligibleCourses: coursesWithDetails.length,
                    isThirdSemester: true
                },
                suggestedCourses: [{
                    courseLoad: Math.min(remainingCourses.length, 4),
                    courses: coursesWithDetails
                }]
            });
        }

        // For other semesters, get course load options based on CGPA
        const courseLoad = getCourseLoadOptions(latestCGPA);
        console.log('Course load options:', courseLoad);

        // Get all courses
        const allCourses = await Course.find({ isActive: true });
        console.log('Total courses found:', allCourses.length);

        // Get eligible courses based on prerequisites and semester
        let eligibleCourses = allCourses
            .filter(course => {
                // Skip if already completed
                if (completedCourses.includes(course.code)) {
                    console.log(`${course.code} skipped: already completed`);
                    return false;
                }

                // Get course info from prerequisites
                const courseInfo = prerequisites[course.code];
                if (!courseInfo) {
                    console.log(`${course.code} skipped: no prerequisite info`);
                    return false;
                }

                // Skip third semester specific courses if not in third semester
                const thirdSemesterOnlyCourses = ['BNG103', 'EMB101', 'HUM103'];
                if (thirdSemesterOnlyCourses.includes(course.code)) {
                    console.log(`${course.code} skipped: can only be taken in third semester`);
                    return false;
                }

                // Allow courses from current semester and next semester
                if (courseInfo.semester > currentSemester + 1) {
                    console.log(`${course.code} skipped: semester ${courseInfo.semester} is too far ahead`);
                    return false;
                }

                // Check prerequisites
                const prereqsMet = checkPrerequisites(course.code, completedCourses);
                if (!prereqsMet) {
                    console.log(`${course.code} skipped: prerequisites not met`);
                    return false;
                }

                console.log(`${course.code} is eligible: semester ${courseInfo.semester}, type ${courseInfo.type}`);
                return true;
            })
            .map(course => {
                const courseInfo = prerequisites[course.code];
                return {
                    ...course.toObject(),
                    type: courseInfo.type || 'Unknown',
                    semester: courseInfo.semester,
                    isRequired: isRequiredCourse(course.code),
                    prerequisites: courseInfo.hardPrereqs,
                    softPrerequisites: courseInfo.softPrereqs
                };
            })
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
            });

        console.log('Eligible courses:', eligibleCourses.map(c => c.code));

        // Generate course suggestions based on course load options
        let suggestedCourses = [];
        if (courseLoad.suggestBoth) {
            // For minimum course load
            const minCourses = eligibleCourses.slice(0, courseLoad.minCourses);
            console.log(`Option 1 (${courseLoad.minCourses} courses):`, minCourses.map(c => c.code));
            
            // For maximum course load - show all eligible courses up to maxCourses
            const maxCourses = eligibleCourses.slice(0, Math.max(courseLoad.maxCourses, eligibleCourses.length));
            console.log(`Option 2 (${courseLoad.maxCourses} courses):`, maxCourses.map(c => c.code));

            // Only add options if there are enough courses
            if (minCourses.length > 0) {
                suggestedCourses.push({
                    courseLoad: courseLoad.minCourses,
                    courses: minCourses
                });
            }
            
            if (maxCourses.length > 0) {
                suggestedCourses.push({
                    courseLoad: courseLoad.maxCourses,
                    courses: maxCourses.slice(0, courseLoad.maxCourses)  // Ensure we only show maxCourses number of courses
                });
            }
        } else {
            const courses = eligibleCourses.slice(0, courseLoad.maxCourses);
            console.log(`Single option (${courseLoad.maxCourses} courses):`, courses.map(c => c.code));
            
            if (courses.length > 0) {
                suggestedCourses.push({
                    courseLoad: courseLoad.maxCourses,
                    courses: courses
                });
            }
        }

        // Add current status information
        const currentStatus = {
            cgpa: latestCGPA,
            currentSemester,
            courseLoadOptions: {
                min: courseLoad.minCourses,
                max: courseLoad.maxCourses,
                suggestBoth: courseLoad.suggestBoth
            },
            completedCourses: completedCourses.length,
            totalCreditsCompleted: completedCourses.length * 3,
            totalEligibleCourses: eligibleCourses.length,
            isThirdSemester: false
        };

        res.json({
            currentStatus,
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

        console.log('User attached to request:', req.user._id);

        // Get student's course history
        const studentCourses = await StudentCourse.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        console.log('Student courses:', studentCourses);

        // Get all completed courses
        const completedCourses = await Course.find({ 
            code: { 
                $in: studentCourses.flatMap(semester => semester.courseCodes) 
            }
        });

        console.log('Completed courses:', completedCourses);

        const progress = trackDegreeProgress(completedCourses);
        console.log('Progress:', progress);

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

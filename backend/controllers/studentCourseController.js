const StudentCourse = require('../models/studentCourse');

// Add courses for a semester
exports.addSemesterCourses = async (req, res) => {
    try {
        const { semester, courseCodes, cgpa } = req.body;
        const userId = req.user._id;

        const studentCourse = new StudentCourse({
            userId,
            semester,
            courseCodes,
            cgpa
        });

        await studentCourse.save();

        res.status(201).json({
            success: true,
            data: studentCourse
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all courses for a student
exports.getStudentCourses = async (req, res) => {
    try {
        const userId = req.user._id;
        const courses = await StudentCourse.find({ userId })
            .sort({ createdAt: -1 });

        // Calculate total statistics
        const totalCredits = courses.reduce((sum, course) => sum + (course.courseCodes.length * 3), 0);
        const completedSemesters = new Set(courses.map(course => course.semester)).size;
        const latestCGPA = courses.length > 0 ? courses[0].cgpa : 0;

        res.status(200).json({
            success: true,
            data: {
                courses,
                statistics: {
                    totalCredits,
                    completedSemesters,
                    latestCGPA
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update semester courses
exports.updateSemesterCourses = async (req, res) => {
    try {
        const { semester, courseCodes, cgpa } = req.body;
        const courseId = req.params.id;
        const userId = req.user._id;

        const updatedCourse = await StudentCourse.findOneAndUpdate(
            { _id: courseId, userId },
            { semester, courseCodes, cgpa },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedCourse
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete semester courses
exports.deleteSemesterCourses = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user._id;

        const deletedCourse = await StudentCourse.findOneAndDelete({ _id: courseId, userId });

        if (!deletedCourse) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

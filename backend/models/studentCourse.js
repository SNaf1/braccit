const mongoose = require('mongoose');

const studentCourseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    courseCodes: [{
        type: String,
        required: true
    }],
    cgpa: {
        type: Number,
        required: true,
        min: 0,
        max: 4
    },
    completedCredits: {
        type: Number,
        default: function() {
            return this.courseCodes.length * 3; // Each course is 3 credits
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual field for completed semesters
studentCourseSchema.virtual('completedSemesters').get(function() {
    return this.semester;
});

const StudentCourse = mongoose.model('StudentCourse', studentCourseSchema);

module.exports = StudentCourse;

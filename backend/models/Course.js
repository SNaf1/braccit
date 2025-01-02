const mongoose = require('mongoose');
const { courseTypes } = require('../data/prerequisites');
const { getCourseCredits, isRequiredCourse } = require('../data/degreePlan');

const scheduleSchema = new mongoose.Schema({
    day: String,
    time: String,
    room: String
}, { _id: false });

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        default: function() {
            return getCourseCredits(this.code);
        },
        min: 0
    },
    semester: {
        type: Number,
        required: true,
        min: 1
    },
    type: {
        type: String,
        enum: Object.values(courseTypes),
        required: true
    },
    isRequired: {
        type: Boolean,
        default: function() {
            return isRequiredCourse(this.code);
        }
    },
    availableSeats: {
        type: Number,
        default: 40,
        min: 0
    },
    faculty: [{
        type: String,
        trim: true
    }],
    schedules: [scheduleSchema],
    labSchedules: [scheduleSchema],
    instructor: {
        type: String,
        trim: true
    },
    capacity: {
        type: Number,
        min: 0
    },
    sectionDetails: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    prerequisites: [{
        type: String,
        ref: 'Course'
    }]
}, {
    timestamps: true
});

// Add index for efficient queries
courseSchema.index({ code: 1 });
courseSchema.index({ semester: 1 });
courseSchema.index({ type: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ 
    code: 'text', 
    name: 'text', 
    description: 'text',
    department: 'text'
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

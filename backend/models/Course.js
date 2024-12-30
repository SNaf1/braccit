const mongoose = require('mongoose');

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
        required: true,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        min: 0
    },
    prerequisites: [{
        type: String,
        ref: 'Course'
    }],
    semester: {
        type: Number,
        required: true,
        min: 1
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
    // BRAC University specific fields
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
    availableSeats: {
        type: Number,
        min: 0
    },
    sectionDetails: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Add text index for search functionality
courseSchema.index({ 
    code: 'text', 
    name: 'text', 
    description: 'text',
    department: 'text'
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

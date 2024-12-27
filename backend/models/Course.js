const mongoose = require('mongoose');

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
        type: String,  // Course codes
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
    }
}, {
    timestamps: true
});

// Add text index for search functionality
courseSchema.index({ code: 'text', name: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

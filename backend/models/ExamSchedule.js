const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
    sl: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true,
        index: true
    },
    section: {
        type: String,
        required: true,
        index: true
    },
    finalDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    dept: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'examschedules' // Explicitly set collection name
});

// Create compound index for faster searching
examScheduleSchema.index({ course: 1, section: 1 });

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);

module.exports = ExamSchedule;

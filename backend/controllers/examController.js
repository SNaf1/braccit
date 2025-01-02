const ExamSchedule = require('../models/ExamSchedule');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'exam-schedule-' + Date.now() + '.pdf')
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

exports.uploadSchedule = upload.single('pdfFile');

// Search exam schedules
exports.searchExams = async (req, res) => {
    try {
        const { course, section } = req.query;
        
        // Return empty array if no query parameters
        if (!course || !section) {
            return res.json([]);
        }

        // Convert course to uppercase and search for exact match
        const upperCourse = course.toUpperCase();
        const examSchedule = await ExamSchedule.findOne({
            course: upperCourse,
            section: section
        });

        if (!examSchedule) {
            return res.status(404).json({ 
                error: `Course '${upperCourse}' with section '${section}' was not found.`
            });
        }

        res.json([examSchedule]);
    } catch (error) {
        console.error('Search exams error:', error);
        res.status(500).json({ error: 'Error searching exam schedules' });
    }
};

// Remove course from search results
exports.removeCourse = async (req, res) => {
    try {
        const { course } = req.body;
        let searchResults = req.session?.searchResults || [];
        
        searchResults = searchResults.filter(result => result.course !== course);
        req.session.searchResults = searchResults;
        
        res.json(searchResults);
    } catch (error) {
        console.error('Remove course error:', error);
        res.status(500).json({ error: 'Error removing course' });
    }
};

// Clear search results
exports.clearResults = async (req, res) => {
    try {
        req.session.searchResults = [];
        res.json([]);
    } catch (error) {
        console.error('Clear results error:', error);
        res.status(500).json({ error: 'Error clearing results' });
    }
};

// Get all exam schedules
exports.getAllExams = async (req, res) => {
    try {
        const examSchedules = await ExamSchedule.find()
            .sort({ finalDate: 1, startTime: 1 });
        res.json(examSchedules);
    } catch (error) {
        console.error('Get all exams error:', error);
        res.status(500).json({ error: 'Error fetching exam schedules' });
    }
};

// Parse PDF and save to database
exports.parsePdfAndSave = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        // Process the PDF content and save to database
        // This is a placeholder - you'll need to implement the actual parsing logic
        // similar to your Python code

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ message: 'PDF processed successfully' });
    } catch (error) {
        console.error('PDF parsing error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Error processing PDF file' });
    }
};

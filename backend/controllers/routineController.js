const Routine = require('../models/Routine');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/routines/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
}).single('routine');

// Get routine
exports.getRoutine = async (req, res) => {
    try {
        const routines = await Routine.find()
            .populate('uploadedBy', 'username')
            .sort('-createdAt');
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Upload routine
exports.uploadRoutine = async (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Please upload a file' });
            }

            const routine = new Routine({
                title: req.body.title,
                description: req.body.description,
                filePath: req.file.path,
                uploadedBy: req.user._id
            });

            await routine.save();
            res.status(201).json(routine);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

// Delete routine
exports.deleteRoutine = async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);
        
        if (!routine) {
            return res.status(404).json({ error: 'Routine not found' });
        }

        if (routine.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this routine' });
        }

        await routine.remove();
        res.json({ message: 'Routine deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

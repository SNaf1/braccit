const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');
const postRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');
const eventRoutes = require('./routes/event');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/b', communityRoutes);
app.use('/api/b', eventRoutes); // Mount event routes under /api/b
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
}

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/braccit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

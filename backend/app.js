const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/braccit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
console.log('Setting up routes...');

app.use('/api/auth', authRoutes);
console.log('Auth routes loaded');

app.use('/api/community', communityRoutes);
console.log('Community routes loaded');

app.use('/api/posts', postRoutes);
console.log('Post routes loaded');

app.use('/api/users', userRoutes);
console.log('User routes loaded');

app.use('/api/courses', courseRoutes);
console.log('Course routes loaded');

app.use('/api/comments', commentRoutes);
console.log('Comment routes loaded');

app.use('/api/notifications', notificationRoutes);
console.log('Notification routes loaded');

app.use('/api/search', searchRoutes);
console.log('Search routes loaded');

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Debug endpoint to check if API is working
app.get('/api/debug', (req, res) => {
    res.json({
        message: 'API is working',
        routes: app._router.stack
            .filter(r => r.route)
            .map(r => ({
                path: r.route.path,
                methods: Object.keys(r.route.methods)
            }))
    });
});

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
}

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    console.log('404 - Not found:', req.path);
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found', path: req.path });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

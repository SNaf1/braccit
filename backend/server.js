const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
console.log('Setting up routes...');

const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');
const postRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');
const courseRoutes = require('./routes/courses');
const studentCourseRoutes = require('./routes/studentCourses');

app.use('/api/auth', authRoutes);
console.log('Auth routes loaded');

app.use('/api/b', communityRoutes);
console.log('Community routes loaded');

app.use('/api/posts', postRoutes);
console.log('Post routes loaded');

app.use('/api/search', searchRoutes);
console.log('Search routes loaded');

app.use('/api/courses', courseRoutes);
console.log('Course routes loaded');

app.use('/api/student-courses', studentCourseRoutes);
console.log('Student course routes loaded');

// Debug endpoint
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

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    app._router.stack
        .filter(r => r.route)
        .forEach(r => {
            console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
        });
});

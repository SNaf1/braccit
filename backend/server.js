const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directories if they don't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/profile-pictures')) {
    fs.mkdirSync('uploads/profile-pictures');
}

// Routes
const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');
const postRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');
const examRoutes = require('./routes/exam');

app.use('/api/auth', authRoutes);
app.use('/api/b', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

const mongoose = require('mongoose');
const Course = require('../models/Course');
const { prerequisites, courseTypes } = require('../data/prerequisites');
const { degreePlan, getCourseCredits, isRequiredCourse } = require('../data/degreePlan');

// Convert prerequisites data to Course documents
const courses = Object.entries(prerequisites).map(([code, info]) => ({
    code,
    name: getBanglaCourseName(code),  // Add proper names for courses
    description: `${code} (${info.type})`,
    credits: getCourseCredits(code),
    semester: info.semester,
    type: info.type,
    isRequired: isRequiredCourse(code),
    isActive: true,
    department: code.match(/^[A-Z]+/)[0] // Extract department from course code (e.g., CSE from CSE110)
}));

// Helper function to get proper course names
function getBanglaCourseName(code) {
    const courseNames = {
        'BNG103': 'Bangla Language and Literature',
        'CSE110': 'Programming Language I',
        'CSE111': 'Programming Language II',
        'CSE230': 'Discrete Mathematics',
        'CSE220': 'Data Structures',
        'CSE221': 'Algorithms',
        'CSE250': 'Project Work I',
        'CSE251': 'Project Work II',
        'CSE330': 'Computer Organization and Architecture',
        'PHY111': 'Physics I',
        'PHY112': 'Physics II',
        'MAT110': 'Mathematics I',
        'MAT120': 'Mathematics II',
        'MAT216': 'Probability and Statistics',
        'ENG101': 'English Language I',
        'ENG102': 'English Language II',
        'EMB101': 'Development Studies',
        'HUM103': 'History of Bangladesh'
    };
    return courseNames[code] || code;
}

async function seedDatabase() {
    try {
        // Connect to MongoDB
        const uri = "mongodb+srv://sadnanornob:dgZMISXUk2DlgOQk@test-db.essm8.mongodb.net/?retryWrites=true&w=majority&appName=test-db";
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
        
        // Clear existing courses
        await Course.deleteMany({});
        console.log('Cleared existing courses');
        
        // Insert new courses
        await Course.insertMany(courses);
        console.log('Inserted new courses');
        
        // Log all inserted courses
        const insertedCourses = await Course.find({});
        console.log('Inserted courses:', insertedCourses.map(c => ({
            code: c.code,
            name: c.name,
            semester: c.semester,
            type: c.type,
            isRequired: c.isRequired
        })));
        
        await mongoose.disconnect();
        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Sample course data representing a Computer Science curriculum
const courses = [
    {
        code: 'CSE101',
        name: 'Introduction to Programming',
        description: 'Basic programming concepts using Python',
        credits: 3,
        prerequisites: [],
        semester: 1,
        department: 'CSE'
    },
    {
        code: 'CSE102',
        name: 'Object Oriented Programming',
        description: 'OOP concepts using Java',
        credits: 3,
        prerequisites: ['CSE101'],
        semester: 2,
        department: 'CSE'
    },
    {
        code: 'MATH101',
        name: 'Calculus I',
        description: 'Introduction to differential calculus',
        credits: 3,
        prerequisites: [],
        semester: 1,
        department: 'MATH'
    },
    {
        code: 'MATH102',
        name: 'Calculus II',
        description: 'Introduction to integral calculus',
        credits: 3,
        prerequisites: ['MATH101'],
        semester: 2,
        department: 'MATH'
    },
    {
        code: 'CSE201',
        name: 'Data Structures',
        description: 'Fundamental data structures and algorithms',
        credits: 4,
        prerequisites: ['CSE102'],
        semester: 3,
        department: 'CSE'
    },
    {
        code: 'CSE202',
        name: 'Database Systems',
        description: 'Introduction to database design and SQL',
        credits: 3,
        prerequisites: ['CSE102'],
        semester: 3,
        department: 'CSE'
    },
    {
        code: 'CSE301',
        name: 'Software Engineering',
        description: 'Software development lifecycle and project management',
        credits: 4,
        prerequisites: ['CSE201', 'CSE202'],
        semester: 4,
        department: 'CSE'
    },
    {
        code: 'CSE302',
        name: 'Operating Systems',
        description: 'OS concepts and system programming',
        credits: 4,
        prerequisites: ['CSE201'],
        semester: 4,
        department: 'CSE'
    },
    {
        code: 'CSE401',
        name: 'Machine Learning',
        description: 'Introduction to ML algorithms and applications',
        credits: 3,
        prerequisites: ['CSE201', 'MATH102'],
        semester: 5,
        department: 'CSE'
    }
];

// Sample student data
const students = [
    {
        username: 'student1',
        email: 'student1@example.com',
        password: 'password123',
        name: 'John Doe',
        completedCourses: [
            {
                course: 'CSE101',
                grade: 'A',
                completedAt: new Date('2023-12-20')
            },
            {
                course: 'MATH101',
                grade: 'B+',
                completedAt: new Date('2023-12-20')
            }
        ],
        currentCourses: ['CSE102', 'MATH102']
    },
    {
        username: 'student2',
        email: 'student2@example.com',
        password: 'password123',
        name: 'Jane Smith',
        completedCourses: [
            {
                course: 'CSE101',
                grade: 'A+',
                completedAt: new Date('2023-12-20')
            },
            {
                course: 'CSE102',
                grade: 'A',
                completedAt: new Date('2023-12-20')
            },
            {
                course: 'MATH101',
                grade: 'A-',
                completedAt: new Date('2023-12-20')
            },
            {
                course: 'MATH102',
                grade: 'B+',
                completedAt: new Date('2023-12-20')
            }
        ],
        currentCourses: ['CSE201', 'CSE202']
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        const uri = "mongodb+srv://sadnanornob:dgZMISXUk2DlgOQk@test-db.essm8.mongodb.net/?retryWrites=true&w=majority&appName=test-db";
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing data
        await Course.deleteMany({});
        console.log('Cleared existing courses');

        // Insert courses
        await Course.insertMany(courses);
        console.log('Inserted sample courses');

        // Clear existing student data
        await User.deleteMany({ username: { $in: students.map(s => s.username) } });
        console.log('Cleared existing student data');

        // Insert students with hashed passwords
        for (const student of students) {
            const hashedPassword = await bcrypt.hash(student.password, 10);
            await User.create({
                ...student,
                password: hashedPassword
            });
        }
        console.log('Inserted sample student data');

        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();

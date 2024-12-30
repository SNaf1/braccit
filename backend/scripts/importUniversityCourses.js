const mongoose = require('mongoose');
const Course = require('../models/Course');
const axios = require('axios');
const connectDB = require('../config/db');

const COURSE_API_URL = 'https://usis-cdn.eniamza.com/usisdump.json';

// Helper function to parse schedule string into a structured format
const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return [];
    
    return scheduleStr.split(',').map(schedule => {
        const match = schedule.match(/([A-Za-z]+)\((.+)\)/);
        if (!match) return null;
        
        const [_, day, timeRoom] = match;
        const [time, room] = timeRoom.split('-');
        return { day, time, room };
    }).filter(Boolean);
};

// Helper function to remove duplicates based on courseCode
const removeDuplicateCourses = (courses) => {
    const uniqueCourses = {};
    courses.forEach(course => {
        if (!uniqueCourses[course.courseCode] || 
            course.availableSeat > uniqueCourses[course.courseCode].availableSeat) {
            uniqueCourses[course.courseCode] = course;
        }
    });
    return Object.values(uniqueCourses);
};

const fetchAndFormatCourses = async () => {
    try {
        console.log('Fetching courses from BRAC USIS...');
        const response = await axios.get(COURSE_API_URL);
        const rawCourses = response.data;
        
        console.log(`Fetched ${rawCourses.length} course sections`);
        
        // Remove duplicate courses (keeping the one with most available seats)
        const uniqueCourses = removeDuplicateCourses(rawCourses);
        console.log(`Reduced to ${uniqueCourses.length} unique courses`);

        // Map the API data to our Course model structure
        const formattedCourses = uniqueCourses.map(course => ({
            code: course.courseCode,
            name: course.courseTitle,
            description: `${course.courseTitle} (${course.courseDetails})`,
            credits: course.courseCredit,
            prerequisites: course.preRequisiteCourses 
                ? course.preRequisiteCourses.split(',').map(p => p.trim())
                : [],
            semester: parseInt(course.courseCode.match(/\d+/)[0] / 100) || 1, // Estimate semester from course code
            department: course.deptName,
            isActive: course.availableSeat > 0,
            // Additional BRAC-specific fields
            schedules: parseSchedule(course.classSchedule),
            labSchedules: parseSchedule(course.classLabSchedule),
            instructor: course.empName,
            capacity: course.defaultSeatCapacity,
            availableSeats: course.availableSeat,
            sectionDetails: course.courseDetails
        }));

        return formattedCourses;
    } catch (error) {
        console.error('Error fetching courses from BRAC USIS:', error);
        throw error;
    }
};

const importCourses = async () => {
    try {
        // Connect to MongoDB using your existing connection
        await connectDB();
        console.log('Connected to MongoDB');

        // Fetch and format courses from API
        const formattedCourses = await fetchAndFormatCourses();
        console.log(`Formatted ${formattedCourses.length} courses`);

        // Clear existing courses
        await Course.deleteMany({});
        console.log('Cleared existing courses');

        // Import new courses
        const result = await Course.insertMany(formattedCourses);
        console.log(`Successfully imported ${result.length} courses`);

        // Log some sample courses
        const courses = await Course.find().limit(5);
        console.log('\nSample imported courses:');
        courses.forEach(course => {
            console.log(`${course.code}: ${course.name}`);
            console.log(`Department: ${course.department}`);
            console.log(`Credits: ${course.credits}`);
            console.log(`Available Seats: ${course.availableSeats}`);
            console.log('Schedules:', course.schedules);
            console.log('---');
        });

    } catch (error) {
        console.error('Error in import process:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run the import
console.log('Starting course import...');
importCourses();

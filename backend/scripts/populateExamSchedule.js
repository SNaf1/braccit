const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const pdfplumber = require('pdf-plumber');

// MongoDB connection string
const MONGO_URI = "mongodb+srv://sadnanornob:dgZMISXUk2DlgOQk@test-db.essm8.mongodb.net/?retryWrites=true&w=majority&appName=test-db";

// MongoDB connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// Import the ExamSchedule model AFTER setting up mongoose options
let ExamSchedule;

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, options);
        console.log('MongoDB connected...');
        
        // Import the model after successful connection
        ExamSchedule = require('../models/ExamSchedule');
        
        // Verify model is registered
        const modelNames = mongoose.modelNames();
        console.log('Registered models:', modelNames);
        
        // Log the collection name
        console.log('Collection name:', ExamSchedule.collection.name);
        
        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        return false;
    }
}

async function parsePdfAndPopulateDb() {
    try {
        // First connect to database
        const connected = await connectDB();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }

        // Path to your PDF file
        const pdfPath = path.join(__dirname, '..', 'uploads', 'Final Exam Schedule Fall 2024.pdf');
        console.log('Reading PDF from:', pdfPath);

        // Read PDF and extract tables
        const pdf = await pdfplumber.open(pdfPath);
        const allExtractedData = [];

        for (const page of pdf.pages) {
            const tables = await page.extract_tables();

            for (const table of tables) {
                const header = table[0];
                let data = table.slice(1); // Skip header row

                if (allExtractedData.length === 0) {
                    // First page, include all data
                    for (const row of data) {
                        if (row.length === header.length) {
                            const dataDict = {};
                            for (let i = 0; i < header.length; i++) {
                                dataDict[header[i]] = row[i];
                            }
                            allExtractedData.push(dataDict);
                        }
                    }
                } else {
                    // Subsequent pages, skip header row
                    data = data.slice(1);
                    for (const row of data) {
                        if (row.length === header.length) {
                            const dataDict = {};
                            for (let i = 0; i < header.length; i++) {
                                dataDict[header[i]] = row[i];
                            }
                            allExtractedData.push(dataDict);
                        }
                    }
                }
            }
        }

        // Process extracted data and save to MongoDB
        const examSchedules = allExtractedData.map(data => ({
            sl: data['SL.'].trim(),
            course: data['Course'].trim(),
            section: data['Section'].trim(),
            finalDate: new Date(data['Final Date']), // Assuming date format is already correct
            startTime: data['Start Time'].trim(),
            endTime: data['End Time'].trim(),
            room: data['Room.'].trim(),
            dept: data['Dept'].trim()
        }));

        // Clear existing records
        const deleteResult = await ExamSchedule.deleteMany({});
        console.log('Cleared existing exam schedules:', deleteResult);

        // Insert the exam schedules
        if (examSchedules.length > 0) {
            await ExamSchedule.insertMany(examSchedules);
            console.log(`Successfully inserted ${examSchedules.length} exam schedules`);
        } else {
            console.log('No exam schedules found to insert');
        }

        // Close the database connection
        await mongoose.disconnect();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the script
console.log('Starting PDF parsing and database population...');
parsePdfAndPopulateDb();

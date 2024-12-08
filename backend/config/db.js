const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = "mongodb+srv://sadnanornob:dgZMISXUk2DlgOQk@test-db.essm8.mongodb.net/?retryWrites=true&w=majority&appName=test-db";
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;

const mongoose = require("mongoose");
const dotenv = require('dotenv');

// Import các Model
const Room = require('../models/Room');
const User = require('../models/User');
const Company = require('../models/Company');
dotenv.config();


const db = {
    Room,
    User,
    Company,
};

async function connectDb() {
    try {
        console.log("Connect to database successfully!!");
        await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
    } catch (error) {
        console.error("Error connecting to the database", error);
    }
}

module.exports = { connectDb, db };
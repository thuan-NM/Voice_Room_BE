const mongoose = require("mongoose");

// Import các Model
const Room = require('../models/Room');
const User = require('../models/User');
const Company = require('../models/Company');


const db = {
    Room,
    User,
    Company,
};

const MONGODB_URL = "mongodb+srv://nguyenminhthuan2003st:112233zZ%40@cluster0.iblshhh.mongodb.net/my-blog";

async function connectDb() {
    try {
        console.log("Connect to database successfully!!");
        await mongoose.connect(MONGODB_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
    } catch (error) {
        console.error("Error connecting to the database", error);
    }
}

module.exports = { connectDb, db };
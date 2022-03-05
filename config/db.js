const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

exports.connect = () => {
    // Connecting to the database
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch((error) => {
            console.log("Database connection failed.");
            console.error(error);
            process.exit(1);
        });
};
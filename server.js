const express = require("express");
const mongoose = require("mongoose");
const { addDataToMongoDB } = require("./SpecialFunction/addDataToMongoDB");
const {transferAndClearSheet}=require("./SpecialFunction/transferAndClear");
const app = express();
const connectDb = require("./connectDb");
const cron = require('node-cron'); // Import node-cron

connectDb();

const userRoutes = require("./Routes/userRoutes");
const inventoryRoutes = require('./Routes/inventoryRoutes');

// Schedule the function to run every day at 12:00 AM
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to update MongoDB from Google Sheets');
  addDataToMongoDB().catch(error => {
    console.error('Error running scheduled task:', error);
  });
});

app.use(express.json());
app.use("/user", userRoutes);
app.use('/inventory', inventoryRoutes);

// Define a basic route
app.get("/", (req, res) => {
  res.send("MongoDB Connection Successful");
});

// Start the server and listen on port 3000
app.listen(3000, () => {
  // addDataToMongoDB();
  transferAndClearSheet();
   console.log("Server is running on port 3000");
});

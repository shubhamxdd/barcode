const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { create_user, delete_user, login } = require("../Resolvers/userResolver");

// Path to the log file
const logFilePath = path.join(__dirname, "../Logs/user.log");

// Ensure Logs directory exists
if (!fs.existsSync(path.join(__dirname, "../Logs"))) {
  fs.mkdirSync(path.join(__dirname, "../Logs"));
}

// Utility function to write logs
const logEvent = (action, name) => {
  const dateTime = new Date().toISOString();
  const logMessage = `${action} user: ${name} at ${dateTime}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
};

// Route to create a new user
router.post("/create", async (req, res) => {
  const { name, password, role } = req.body;
  const result = await create_user(name, password, role);

  // Log the user creation event
  if (result.success) {
    logEvent("Created", name);
  }

  res.json(result);
});

// Route to login a user
router.post("/login", async (req, res) => {
  const { name, password } = req.body;
  const result = await login(name, password);

  // Log the login event
  if (result.success) {
    logEvent("Logged in", name);
  }

  res.json(result);
});

// Route to delete a user
router.delete("/delete", async (req, res) => {
  const { name } = req.body;
  const result = await delete_user(name);

  // Log the user deletion event
  if (result.success) {
    logEvent("Deleted", name);
  }

  res.json(result);
});

module.exports = router;

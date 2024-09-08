const fs = require('fs');
const path = require('path');
const Product = require('../Models/Product');
const Inventory = require('../Models/Inventory');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Load Google Sheets credentials
const credentials = require('../config/ google_credentials.json');

// Configure the JWT client
const client = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Google Sheet ID and range (replace with your actual Google Sheet ID)
const SPREADSHEET_ID = '1CF9ZBxHHWd7F9YXG9gILgbshsIdfykuFO-9-D0F_8zo';
const SHEET_NAME = 'Sheet1';

const addOrUpdateInventory = async (req, res) => {
  const { barcode, quantity, remarks, establishment, username } = req.body;

  try {
    // Find the product by barcode
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if the product already exists in the inventory
    let inventory = await Inventory.findOne({ product: product._id, establishment });

    if (inventory) {
      // If it exists, update the quantity
      inventory.quantity += quantity;
      inventory.remarks = remarks || inventory.remarks;  // Optionally update remarks
    } else {
      // If it doesn't exist, create a new inventory entry
      inventory = new Inventory({
        product: product._id,
        quantity,
        remarks,
        establishment,
      });
    }

    // Save the inventory record
    // await inventory.save();

    // Log the action in a text file
    const logMessage = `${new Date().toISOString()} - ${username} added ${quantity} of product ${product.productName} (Barcode: ${barcode}) to inventory at ${establishment}\n`;
    fs.appendFile(path.join(__dirname, '../Logs/inventorylogs.log'), logMessage, (err) => {
      if (err) {
        console.error('Failed to write to log file', err);
      }
    });

    // Prepare the data to log into Google Sheets
    const row = [
      username,
      product.productName,
      barcode,
      quantity,
      'ok',  // Default value for `isAdded`
      new Date().toISOString(),  // Timestamp
    ];

    // Append data to Google Sheets
    const sheets = google.sheets({ version: 'v4', auth: client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,  // Adjust based on your sheet columns
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [row],
      },
    });

    res.status(200).json({ message: 'Inventory updated successfully.', inventory });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  addOrUpdateInventory
};

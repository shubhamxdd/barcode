const express = require('express');
const router = express.Router();
const { addOrUpdateInventory } = require("../Resolvers/inventoryResolver");

const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

// Route to handle adding or updating inventory
router.post('/inventory', addOrUpdateInventory);

module.exports = router;

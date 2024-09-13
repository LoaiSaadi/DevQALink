// routes/pools.js
const express = require('express');
const router = express.Router();
const poolsController = require('../controllers/poolsController');

// GET request to list all pools
router.get('/getAllPools', poolsController.getAllPools); // http://localhost:3000/pools/getAllPools

module.exports = router;

// controllers/poolsController.js
const Pool = require('../models/poolModel');

// Handle GET request to list all pools
exports.getAllPools = async (req, res) => {
    try {
        const pools = await Pool.find();
        res.status(200).json(pools);
    } catch (error) {
        console.error('Error fetching pools:', error);
        res.status(500).json({
            message: 'Error fetching pools',
            error: error.message
        });
    }
};


const express = require('express');
const router = express.Router();
const versionBuildController = require('../../controllers/buildsControllers/versionBuildController');

// GET request to list all version builds
router.get('/allVersionBuilds', versionBuildController.getAllVersionBuilds); // http://localhost:3000/builds/allVersionBuilds

module.exports = router;
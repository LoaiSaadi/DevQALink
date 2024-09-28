const express = require('express');
const router = express.Router();
const reportsController = require('../../controllers/reportsControllers/reportsController');

// Update the route to send the entire job object
router.post('/jira/openBug', reportsController.openJiraBug); // http://localhost:3000/reports/jira/openBug
router.post('/sendReport', reportsController.sendReport); // http://localhost:3000/reports/sendReport

module.exports = router;

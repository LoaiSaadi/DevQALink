const express = require('express');
const router = express.Router();
const jiraReportsController = require('../../controllers/reportsControllers/jiraReportsController');

// Update the route to send the entire job object
router.post('/jira/openBug', jiraReportsController.openJiraBug); // http://localhost:3000/reports/jira/openBug

module.exports = router;

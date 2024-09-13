const express = require('express');
const router = express.Router();
const readyJobsController = require('../controllers/readyJobsController');

// POST request to add a new ready job
router.post('/addJob', readyJobsController.addReadyJob); // http://localhost:3000/jobs/readyJobs/addJob
router.delete('/deleteJobById/:jobId', readyJobsController.deleteJobById); // http://localhost:3000/jobs/readyJobs/deleteJobById/:jobId
router.put('/updateJobById/:jobId', readyJobsController.updateJobById); // http://localhost:3000/jobs/readyJobs/updateJobById/:jobId

// GET request to list all ready jobs
router.get('/allReadyJobs', readyJobsController.getReadyJobs); // http://localhost:3000/jobs/readyJobs/allReadyJobs

module.exports = router; // example

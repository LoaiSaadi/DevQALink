const express = require('express');
const router = express.Router();
const completedJobsController = require('../../controllers/jobsControllers/completedJobsController');

// GET request to list all completed jobs
router.get('/allCompletedJobs', completedJobsController.getCompletedJobs); // http://localhost:3000/jobs/completedJobs/allCompletedJobs
router.get('/getJobById/:jobId', completedJobsController.getJobById); // http://localhost:3000/jobs/completedJobs/getJobById/:jobId
router.post('/addJob', completedJobsController.addCompletedJob); // http://localhost:3000/jobs/completedJobs/addJob
router.delete('/deleteJobById/:jobId', completedJobsController.deleteJobById); // http://localhost:3000/jobs/completedJobs/deleteJobById/:jobId

module.exports = router; 

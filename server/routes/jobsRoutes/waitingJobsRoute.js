const express = require('express');
const router = express.Router();
const waitingJobsController = require('../../controllers/jobsControllers/waitingJobsController');

// POST request to add a new waiting job
router.post('/addJob', waitingJobsController.addWaitingJob); // http://localhost:3000/jobs/waitingJobs/addJob
router.delete('/deleteJobById/:jobId', waitingJobsController.deleteJobById); // http://localhost:3000/jobs/waitingJobs/deleteJobById/:jobId
router.put('/updateJobById/:jobId', waitingJobsController.updateJobById); // http://localhost:3000/jobs/waitingJobs/updateJobById/:jobId
router.post('/addSameJob', waitingJobsController.addSameJob); // http://localhost:3000/jobs/waitingJobs/addSameJob

// GET request to list all waiting jobs
router.get('/allWaitingJobs', waitingJobsController.getWaitingJobs); // http://localhost:3000/jobs/waitingJobs/allWaitingJobs
router.get('/getJobById/:jobId', waitingJobsController.getJobById); // http://localhost:3000/jobs/waitingJobs/getJobById/:jobId

module.exports = router;

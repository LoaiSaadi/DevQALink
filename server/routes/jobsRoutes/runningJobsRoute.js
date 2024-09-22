const express = require('express');
const router = express.Router();
const runningJobsController = require('../../controllers/jobsControllers/runningJobsController');

// GET request to list all running jobs
router.get('/allRunningJobs', runningJobsController.getRunningJobs); // http://localhost:3000/jobs/runningJobs/allRunningJobs
router.get('/getJobById/:jobId', runningJobsController.getJobById); // http://localhost:3000/jobs/runningJobs/getJobById/:jobId
router.post('/addJob', runningJobsController.addRunningJob); // http://localhost:3000/jobs/runningJobs/addJob
router.delete('/deleteJobById/:jobId', runningJobsController.deleteJobById); // http://localhost:3000/jobs/runningJobs/deleteJobById/:jobId
router.put('/updateDurationById/:jobId', runningJobsController.updateDurationAndTestStatusById); // http://localhost:3000/jobs/runningJobs/updateDurationById/:jobId

module.exports = router;
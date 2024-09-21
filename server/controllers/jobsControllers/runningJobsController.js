const RunningJob = require('../../models/jobsModels/runningJobsModel');
const moment = require('moment-timezone');

exports.getRunningJobs = async (req, res) => {
    try {
        const runningJobs = await RunningJob.find();
        res.status(200).json(runningJobs);
    } catch (error) {
        console.error('Error fetching running jobs:', error);
        res.status(500).json({
            message: 'Error fetching running jobs',
            error: error.message
        });
    }
};

exports.addRunningJob = async (req, res) => {
    try {
        const {
            jobId,
            jobName,
            testToRun,
            resourcePool,
            buildVersion,
            jobRunType,
            scheduleType,
            scheduleTime,
            priorityLevel,
            createdDate,
            createdTime,
            estimatedTime,
            activationStatus,
            resumeJob,
        } = req.body;

        // Create a new RunningJob object
        const newJob = new RunningJob({
            jobId,
            jobName,
            testToRun,
            resourcePool,
            buildVersion,
            jobRunType,
            scheduleType,
            scheduleTime,
            priorityLevel,
            createdDate,
            createdTime,
            estimatedTime,
            activationStatus,
            resumeJob,
            duration: '00:00:00'
        });

        // Save the new RunningJob object
        const savedJob = await newJob.save();

        // runTheJob(savedJob);

        res.status(201).json({
            message: 'Job added successfully',
            job: savedJob
        });
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({
            message: 'Error saving job',
            error: error.message
        });
    }
};

// const runTheJob = async (job) => {
//     const { jobId } = job;

//     let duration = 0;
//     const totalDuration = Math.floor(Math.random() * (60 - 20 + 1)) + 20; // Random between 20 and 60 seconds

//     const updateInterval = setInterval(async () => {
//         duration++;

//         // Format the duration as HH:MM:SS
//         const hours = String(Math.floor(duration / 3600)).padStart(2, '0');
//         const minutes = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
//         const seconds = String(duration % 60).padStart(2, '0');
//         const formattedDuration = `${hours}:${minutes}:${seconds}`;

//         // Emit the timer update to the frontend via WebSocket
//         io.emit('timerUpdate', { jobId, duration: formattedDuration });

//         // Update the job's duration field in the database
//         job.duration = formattedDuration;
//         await job.save();

//         if (duration >= totalDuration) {
//             clearInterval(updateInterval);
//             console.log(`Job ${jobId} finished running.`);
//             // Optionally, you can update the job status to 'Completed' here
//         }
//     }, 1000); // Update every second
// };

exports.updateDurationById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const { duration } = req.body;

        const updatedJob = await RunningJob.findOneAndUpdate(
            { jobId },
            { duration },
            { new: true }
        );

        if (updatedJob) {
            res.status(200).json({
                message: 'Duration updated successfully',
                job: updatedJob
            });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
    catch (error) {
        console.error('Error updating duration:', error);
        res.status(500).json({
            message: 'Error updating duration',
            error: error.message
        });
    }
};


exports.deleteJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        console.log('jobId:', jobId);

        // Use findOneAndDelete to search by the jobId field and delete the document
        const deletedJob = await RunningJob.findOneAndDelete({ jobId });
        console.log('deletedJob:', deletedJob);

        if (deletedJob) {
            res.status(200).json({
                message: 'Job deleted successfully',
                job: deletedJob
            });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({
            message: 'Error deleting job',
            error: error.message
        });
    }
};

exports.updateRunningJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const {
            jobName,
            testToRun,
            resourcePool,
            buildVersion,
            jobRunType,
            scheduleType,
            scheduleTime,
            priorityLevel,
            createdDate,
            createdTime,
            estimatedTime,
            activationStatus,
            resumeJob
        } = req.body;

        console.log("req body is: ", req.body); // Log entire request body
        console.log("jobId: ", jobId);
        console.log("jobName: ", jobName);
        console.log("testToRun: ", testToRun);
        console.log("resourcePool: ", resourcePool);
        console.log("buildVersion: ", buildVersion);
        console.log("jobRunType: ", jobRunType);
        console.log("scheduleType: ", scheduleType);
        console.log("scheduleTime: ", scheduleTime);
        console.log("priorityLevel: ", priorityLevel);
        console.log("createdDate: ", createdDate);
        console.log("createdTime: ", createdTime);
        console.log("estimatedTime: ", estimatedTime);
        console.log("activationStatus: ", activationStatus);

        const updatedJob = await RunningJob.findOneAndUpdate(
            { jobId },
            {
                jobName,
                testToRun,
                resourcePool,
                buildVersion,
                jobRunType,
                scheduleType,
                scheduleTime,
                priorityLevel,
                createdDate,
                createdTime,
                estimatedTime,
                activationStatus,
                resumeJob
            },
            { new: true }
        );

        if (updatedJob) {
            res.status(200).json({
                message: 'Job updated successfully',
                job: updatedJob
            });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({
            message: 'Error updating job',
            error: error.message
        });
    }
}
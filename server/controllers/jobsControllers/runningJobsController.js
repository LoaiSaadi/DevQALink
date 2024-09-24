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
            runningCluster
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
            duration: '00:00:00',
            runningCluster
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


exports.updateDurationAndTestStatusById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const { duration } = req.body;


        const updatedJob = await RunningJob.findOneAndUpdate(
            { jobId },
            { duration},
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
};

exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const runningJob = await RunningJob.findOne({ jobId });
        res.status(200).json(runningJob);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};

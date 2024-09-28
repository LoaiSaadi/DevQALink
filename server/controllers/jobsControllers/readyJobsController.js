const ReadyJob = require('../../models/jobsModels/readyJobsModel');
const moment = require('moment-timezone');

const jobIds = [];

// Handle POST request to add a new ready job
exports.addReadyJob = async (req, res) => {
    try {
        const {jobId, jobName, testToRun, resourcePool, buildVersion, jobRunType, scheduleType, createdDate, createdTime, scheduleTime, priorityLevel, activationStatus, estimatedTime, resumeJob, triggeredBy } = req.body;

        // Check if the jobId already exists in the global array
        if (jobIds.includes(jobId)) {
            return res.status(400).json({
                message: 'Job ID already exists, cannot add the same job again'
            });
        }
        jobIds.push(jobId);

        //  // Find or create a record that contains the array of job IDs
        // let jobIdsRecord = await JobIds.findOne({}); // You might want to adjust the query based on your application

        // // Initialize if it doesn't exist
        // if (!jobIdsRecord) {
        //     jobIdsRecord = new JobIds({ jobIds: [] });
        // }

        // // Check if the jobId already exists in the array
        // if (jobIdsRecord.jobIds.includes(jobId)) {
        //     return res.status(400).json({
        //         message: 'Job ID already exists, cannot add the same job again (ready)',
        //     });
        // }

        // // Add the jobId to the array
        // jobIdsRecord.jobIds.push(jobId);
        // await jobIdsRecord.save();
        
        const newJob = new ReadyJob({
            jobId,
            jobName,
            testToRun,
            resourcePool,
            buildVersion,
            jobRunType,
            scheduleType,
            scheduleTime,
            priorityLevel,
            estimatedTime,
            createdDate,
            createdTime,
            activationStatus,
            jobStatus: 'Ready',
            resumeJob,
            runningCluster: null,
            triggeredBy
        });
        
        const savedJob = await newJob.save();

        res.status(201).json({
            message: 'Job added successfully',
            job: savedJob
        });
    } catch (error) {
        console.error('Error saving ready job:', error);
        res.status(500).json({
            message: 'Error saving ready job',
            error: error.message
        });
    }
};

exports.deleteJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        console.log('jobId:', jobId);

        
        // // Find the record containing the array of job IDs
        // const jobIdsRecord = await JobIds.findOne({});
        // if (!jobIdsRecord || !jobIdsRecord.jobIds.includes(jobId)) {
        //     return res.status(404).json({
        //         message: 'Job ID not found in the list (ready)',
        //     });
        // }

        // Use findOneAndDelete to search by the jobId field and delete the document
        const deletedJob = await ReadyJob.findOneAndDelete({ jobId });
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


exports.updateJobById = async (req, res) => {
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
            resumeJob,
            triggeredBy
        } = req.body;

        // Create an object for fields that should be updated
        const updateFields = {};

        if (jobName !== undefined) updateFields.jobName = jobName;
        if (testToRun !== undefined) updateFields.testToRun = testToRun;
        if (resourcePool !== undefined) updateFields.resourcePool = resourcePool;
        if (buildVersion !== undefined) updateFields.buildVersion = buildVersion;
        if (jobRunType !== undefined) updateFields.jobRunType = jobRunType;
        if (scheduleType !== undefined) {
            const validScheduleTypes = ['One-Time Job', 'Reoccurring Job'];
            updateFields.scheduleType = validScheduleTypes.includes(scheduleType) ? scheduleType : '-';
        }
        if (scheduleTime !== undefined) updateFields.scheduleTime = scheduleTime;
        if (priorityLevel !== undefined) updateFields.priorityLevel = priorityLevel;
        if (createdDate !== undefined) updateFields.createdDate = createdDate;
        if (createdTime !== undefined) updateFields.createdTime = createdTime;
        if (estimatedTime !== undefined) updateFields.estimatedTime = estimatedTime;
        if (activationStatus !== undefined) updateFields.activationStatus = activationStatus
        if (resumeJob !== undefined) updateFields.resumeJob = resumeJob;
        if (triggeredBy !== undefined) updateFields.triggeredBy = triggeredBy;

        // Update the created date and time for tracking purposes
        // const nowInJerusalem = moment().tz('Asia/Jerusalem');
        // updateFields.createdDate = nowInJerusalem.format('YYYY-MM-DD');
        // updateFields.createdTime = nowInJerusalem.format('HH:mm:ss');

        // Use findOneAndUpdate to search by the jobId field and update the document
        const updatedJobDoc = await ReadyJob.findOneAndUpdate({ jobId }, updateFields, { new: true });

        if (updatedJobDoc) {
            res.status(200).json({
                message: 'Job updated successfully',
                job: updatedJobDoc
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

// Handle GET request to list all ready jobs
exports.getReadyJobs = async (req, res) => {
    try {
        // const readyJobs = await ReadyJob.find();
        const readyJobs = await ReadyJob.find().sort({ priorityLevel: -1 });

        res.status(200).json(readyJobs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await ReadyJob.findOne({ jobId });
        res.status(200).json(job);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};

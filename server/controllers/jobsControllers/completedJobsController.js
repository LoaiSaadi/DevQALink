const CompletedJob = require('../../models/jobsModels/completedJobsModel');
const Cluster = require('../../models/managementModels/clustersModel');
const moment = require('moment-timezone');

exports.getCompletedJobs = async (req, res) => {
    try {
        const completedJobs = await CompletedJob.find();
        res.status(200).json(completedJobs);
    } catch (error) {
        console.error('Error fetching completed jobs:', error);
        res.status(500).json({
            message: 'Error fetching completed jobs',
            error: error.message
        });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const completedJob = await CompletedJob.findOne({ jobId });
        res.status(200).json(completedJob);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};


            

exports.addCompletedJob = async (req, res) => {
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
            duration,
            runningCluster,
            triggeredBy
        } = req.body;

        // Simulated array of possible failure reasons
        const failureReasons = [
            'Network Timeout',
            'Server Error',
            'Resource Allocation Failure',
            'Test Environment Misconfiguration',
            'Unknown Error',
            'Database Connection Lost',
            'Insufficient Memory',
        ];

        const result = Math.random() < 0.7 ? 'Succeeded' : 'Failed';
        // Get the current date and time in Jerusalem timezone
        const nowInJerusalem = moment().tz('Asia/Jerusalem');
        const completedDate = nowInJerusalem.format('YYYY-MM-DD');
        const completedTime = nowInJerusalem.format('HH:mm:ss');

        // Find the cluster from the Cluster collection using runningCluster._id
        const cluster = await Cluster.findById(runningCluster);
        console.log('cluster32:', cluster);
        if (!cluster) {
            return res.status(404).json({ message: 'Running cluster not found' });
        }

        const runnedOnCluster = cluster.clusterName;
        console.log('runnedOnCluster32:', runnedOnCluster);

        // Determine the generatedFailureReason reason based on test status
        const generatedFailureReason = result === 'Succeeded' ? '-' : failureReasons[Math.floor(Math.random() * failureReasons.length)];

        // Create a new CompletedJob object
        const newJob = new CompletedJob({
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
            duration,
            testStatus: result,
            completedDate,
            completedTime,
            runnedOnCluster,
            failureReason: generatedFailureReason, // Assign the failure reason or '-' based on the result
            triggeredBy
        });

        // Save the new CompletedJob object
        const savedJob = await newJob.save();

        res.status(201).json({
            message: 'Job completed successfully',
            job: savedJob
        });
    } catch (error) {
        console.error('Error saving completed job:', error);
        res.status(500).json({
            message: 'Error saving completed job',
            error: error.message
        });
    }
};

exports.deleteJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        // Use findOneAndDelete to search by the jobId field and delete the document
        const deletedJob = await CompletedJob.findOneAndDelete({ jobId });
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
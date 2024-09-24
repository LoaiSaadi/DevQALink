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
            runningCluster
        } = req.body;

        const result = Math.random() < 0.7 ? 'Succeeded' : 'Failed';
        // Get the current date and time in Jerusalem timezone
        const nowInJerusalem = moment().tz('Asia/Jerusalem');
        const completedDate = nowInJerusalem.format('YYYY-MM-DD');
        const completedTime = nowInJerusalem.format('HH:mm:ss');

        // // Fetch all clusters in this pool by their IDs
        // const clusterIds = resourcePool.clusters.map(clusterId => new mongoose.Types.ObjectId(clusterId));
        // console.log('clusterIds:', clusterIds);
        // const clusters = await Cluster.find({ _id: { $in: clusterIds } });
        // console.log('clusters:', clusters);

        // // Find the running cluster within the resource pool's clusters array
        // const runnedOnCluster = clusters.find(cluster => cluster._id.equals(runningCluster)).clusterName;
        // console.log('runnedOnCluster:', runnedOnCluster);

        // Find the cluster from the Cluster collection using runningCluster._id
        const cluster = await Cluster.findById(runningCluster);
        console.log('cluster32:', cluster);
        if (!cluster) {
            return res.status(404).json({ message: 'Running cluster not found' });
        }

        const runnedOnCluster = cluster.clusterName;
        console.log('runnedOnCluster32:', runnedOnCluster);

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
            // runningCluster
            runnedOnCluster
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



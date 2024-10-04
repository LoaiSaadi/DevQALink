const Pool = require('../../models/managementModels/poolsModel');
const Cluster = require('../../models/managementModels/clustersModel');  // Assuming you have a Cluster model
const ReadyJob = require('../../models/jobsModels/readyJobsModel');
const RunningJob = require('../../models/jobsModels/runningJobsModel');
const moment = require('moment-timezone');
const mongoose = require('mongoose');


exports.allPools = async (req, res) => {
    try {
        const pools = await Pool.find();
        res.status(200).json(pools);
    } catch (error) {
        console.error('Error fetching pools:', error);
        res.status(500).json({
            message: 'Error fetching pools',
            error: error.message
        });
    }
};

exports.addPool = async (req, res) => {
    try {
        const { poolName, poolDescription, clusters } = req.body;

        // Get the current date and time in Jerusalem timezone
        const nowInJerusalem = moment().tz('Asia/Jerusalem');
        const createdDate = nowInJerusalem.format('YYYY-MM-DD');
        const createdTime = nowInJerusalem.format('HH:mm:ss');

        const newClustersNumber = clusters.length;

        // Fetch clusters to sum up serversNumber
        const clusterDetails = await Cluster.find({ _id: { $in: clusters } });
        
        // Calculate total serversNumber by summing serversNumber of each cluster
        const newServersNumber = clusterDetails.reduce((total, cluster) => total + cluster.serversNumber, 0);

        const newPool = new Pool({
            poolName,
            poolDescription,
            clusters,
            clustersNumber: newClustersNumber,
            serversNumber: newServersNumber, 
            createdDate,
            createdTime
        });

        const savedPool = await newPool.save();

        res.status(201).json({
            message: 'Pool added successfully',
            pool: savedPool
        });
    } catch (error) {
        console.error('Error saving pool:', error);
        res.status(500).json({
            message: 'Error saving pool',
            error: error.message
        });
    }
};

exports.deletePoolById = async (req, res) => {
    try {
        const poolId = req.params.poolId;

        // Use findOneAndDelete to search by the poolId field and delete the document
        const deletedPool = await Pool.findOneAndDelete({ poolId });
        console.log('deletedPool:', deletedPool);

        if (deletedPool) {
            res.status(200).json({
                message: 'Pool deleted successfully',
                pool: deletedPool
            });
        } else {
            res.status(404).json({ message: 'Pool not found' });
        }
    } catch (error) {
        console.error('Error deleting pool:', error);
        res.status(500).json({
            message: 'Error deleting pool',
            error: error.message
        });
    }
};

exports.updatePoolById = async (req, res) => {
    try {
        const poolId = req.params.poolId;
        const { poolName, poolDescription, poolStatus } = req.body;

        const updatedPool = await Pool.findOneAndUpdate(
            { poolId },
            { poolName, poolDescription, poolStatus },
            { new: true }
        );

        if (updatedPool) {
            res.status(200).json({
                message: 'Pool updated successfully',
                pool: updatedPool
            });
        } else {
            res.status(404).json({ message: 'Pool not found' });
        }
    } catch (error) {
        console.error('Error updating pool:', error);
        res.status(500).json({
            message: 'Error updating pool',
            error: error.message
        });
    }
};


exports.removeClusterFromPoolById = async (req, res) => {
    try {
        const poolId = req.params.poolId;
        const sendedCluster = req.body;

        const findPool = await Pool.findOne({ _id: poolId });

        if (findPool) {
            const newClusters = findPool.clusters.filter(cluster => cluster.toString() !== sendedCluster.cluster._id.toString());

            findPool.clusters = newClusters;
            findPool.clustersNumber = newClusters.length;

            // Calculate the total number of servers in the pool
            let totalServersNumber = 0;
            for (const clusterId of newClusters) {
                const cluster = await Cluster.findById(clusterId);
                if (cluster) {
                    totalServersNumber += cluster.serversNumber;
                }
            }
            findPool.serversNumber = totalServersNumber;

            await findPool.save();

            res.status(200).json({
                message: 'Cluster removed from pool successfully and cluster list updated',
                pool: findPool
            });
        } else {
            res.status(404).json({ message: 'Pool not found' });
        }
    } catch (error) {
        console.error('Error removing cluster from pool:', error);
        res.status(500).json({
            message: 'Error removing cluster from pool',
            error: error.message
        });
    }
};

exports.findClusterAndUpdate = async (req, res) => {
    const job  = req.body;

    try {
        // Find the pool with the given resourcePool name
        const pool = await Pool.findOne({ poolName: job.resourcePool });
        if (!pool) {
            return res.status(404).json({ ok: false, message: 'Pool not found' });
        }

        // Fetch all clusters in this pool by their IDs
        const clusterIds = pool.clusters.map(clusterId => new mongoose.Types.ObjectId(clusterId));
        const clusters = await Cluster.find({ _id: { $in: clusterIds } });

        // Find an available cluster within the fetched clusters
        const availableCluster = clusters.find(cluster => cluster.clusterStatus === 'Available');

        if (!availableCluster) {
            // If no available cluster is found, return a JSON response with ok: false
            return res.status(200).json({ success: false, message: 'No available cluster found in the pool' });
        }

        // Update the status of the found cluster to 'Running'
        availableCluster.clusterStatus = 'Running';
        await availableCluster.save();

        // Check if there is any other available cluster in the pool
        const newAvailableCluster = clusters.find(cluster => cluster.clusterStatus === 'Available');
        if (!newAvailableCluster) {
            pool.poolStatus = 'Running';
        }
        else {
            pool.poolStatus = 'Available';
        }
        await pool.save();

        // Find and update the job with the new running cluster
        const newJob = await ReadyJob.findOne({ _id: job._id });
        console.log('newJob12:', newJob);
        if (!newJob) {
            return res.status(404).json({ ok: false, message: 'Job not found' });
        }

        newJob.runningCluster = availableCluster._id;  // Save the ObjectId of the cluster
        await newJob.save();

        // Send the updated cluster back in the response with ok: true
        return res.status(200).json({ newJob, success: true, cluster: availableCluster });
    } catch (error) {
        console.error('Error finding and updating the cluster:', error);
        return res.status(500).json({ ok: false, message: 'Server error' });
    }
};

exports.freeCluster = async (req, res) => {
    const {job} = req.body;
    
    try {
        // Find the resource pool by name
        const resourcePool = await Pool.findOne({ poolName: job.resourcePool });
        
        if (!resourcePool) {
            console.log('Resource pool not found for:', job.resourcePool);
            return res.status(404).json({ ok: false, message: 'Resource pool not found' });
        }

        // Fetch all clusters in this pool by their IDs
        const clusterIds = resourcePool.clusters.map(clusterId => new mongoose.Types.ObjectId(clusterId));
        const clusters = await Cluster.find({ _id: { $in: clusterIds } });

        // Find the running cluster within the resource pool's clusters array
        const runningCluster = clusters.find(cluster => cluster._id.equals(job.runningCluster));
        
        if (!runningCluster) {
            console.log('No running cluster found in the specified resource pool:', job.resourcePool);
            return res.status(404).json({ ok: false, message: 'No running cluster found in the specified resource pool' });
        }

        // Update the status of the found running cluster to 'Available'
        runningCluster.clusterStatus = 'Available';
        await runningCluster.save(); // Save the updated resource pool

        // Check if there is any other running cluster in the pool
        const newAvailableCluster = clusters.find(cluster => cluster.clusterStatus === 'Running');
        if (newAvailableCluster) {
            resourcePool.poolStatus = 'Running';
        }
        else {
            resourcePool.poolStatus = 'Available';
        }
        await resourcePool.save();


        // Send the updated cluster back in the response with ok: true
        return res.status(200).json({ success: true, cluster: runningCluster });
    } catch (error) {
        console.error('Error freeing the cluster:', error);
        return res.status(500).json({ ok: false, message: 'Server error' });
    }
};

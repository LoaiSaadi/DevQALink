const Pool = require('../../models/managementModels/poolsModel');
const Cluster = require('../../models/managementModels/clustersModel');  // Assuming you have a Cluster model
const moment = require('moment-timezone');

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
        const { poolName, poolDescription } = req.body;

        const updatedPool = await Pool.findOneAndUpdate(
            { poolId },
            { poolName, poolDescription },
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

const Cluster = require('../../models/managementModels/clustersModel');
const Server = require('../../models/managementModels/serversModel');
const moment = require('moment-timezone');

exports.allClusters = async (req, res) => {
    try {
        const clusters = await Cluster.find();
        res.status(200).json(clusters);
    } catch (error) {
        console.error('Error fetching clusters:', error);
        res.status(500).json({
            message: 'Error fetching clusters',
            error: error.message
        });
    }
};

exports.addCluster = async (req, res) => {
    try {
        const { clusterName, clusterDescription, servers, testRunnerServer } = req.body;
        
        // Fetch the server objects based on the server IPs in the `servers` array
        const serverObjects = await Server.find({ serverIp: { $in: servers } });

        // Fetch the test runner server object
        const testRunnerServerObject = await Server.findOne({ serverIp: testRunnerServer.serverIp });

        if (!testRunnerServerObject) {
            return res.status(400).json({
                message: 'Test Runner Server not found',
            });
        }


        // Get the current date and time in Jerusalem timezone
        const nowInJerusalem = moment().tz('Asia/Jerusalem');
        const createdDate = nowInJerusalem.format('YYYY-MM-DD');
        const createdTime = nowInJerusalem.format('HH:mm:ss');

        // Create the new cluster, passing in the server objects and the test runner server object
        const newCluster = new Cluster({
            clusterName,
            clusterDescription,
            servers,
            testRunnerServer,
            clusterStatus: 'Available',
            createdDate,
            createdTime
        });

        // Save the new cluster to the database
        const savedCluster = await newCluster.save();

        res.status(201).json({
            message: 'Cluster added successfully',
            cluster: savedCluster
        });
    } catch (error) {
        console.error('Error saving cluster:', error);
        res.status(500).json({
            message: 'Error saving cluster',
            error: error.message
        });
    }
};

exports.deleteClusterById = async (req, res) => {
    try {
        const clusterId = req.params.clusterId;

        // Use findOneAndDelete to search by the clusterId field and delete the document
        const deletedCluster = await Cluster.findOneAndDelete({ clusterId });
        console.log('deletedCluster:', deletedCluster);

        if (deletedCluster) {
            res.status(200).json({
                message: 'Cluster deleted successfully',
                cluster: deletedCluster
            });
        } else {
            res.status(404).json({ message: 'Cluster not found' });
        }
    } catch (error) {
        console.error('Error deleting cluster:', error);
        res.status(500).json({
            message: 'Error deleting cluster',
            error: error.message
        });
    }
};

exports.updateClusterById = async (req, res) => {
    try {
        const clusterId = req.params.clusterId;
        const { clusterName, clusterDescription } = req.body;

        const updatedCluster = await Cluster.findOneAndUpdate(
            { clusterId },
            { clusterName, clusterDescription },
            { new: true }
        );

        if (updatedCluster) {
            res.status(200).json({
                message: 'Cluster updated successfully',
                cluster: updatedCluster
            });
        } else {
            res.status(404).json({ message: 'Cluster not found' });
        }
    }
    catch (error) {
        console.error('Error updating cluster:', error);
        res.status(500).json({
            message: 'Error updating cluster',
            error: error.message
        });
    }
};

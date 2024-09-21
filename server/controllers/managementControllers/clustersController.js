const { find } = require('../../models/jobsModels/waitingJobsModel');
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
        const { clusterName, clusterDescription, servers, testRunnerServer, poolConnectedTo } = req.body;

        // Get the current date and time in Jerusalem timezone
        const nowInJerusalem = moment().tz('Asia/Jerusalem');
        const createdDate = nowInJerusalem.format('YYYY-MM-DD');
        const createdTime = nowInJerusalem.format('HH:mm:ss');

        const newServersNumber = servers.length;
        console.log('newServersNumber:', newServersNumber);
        // Create the new cluster, passing in the server objects and the test runner server object
        const newCluster = new Cluster({
            clusterName,
            clusterDescription,
            servers,
            testRunnerServer,
            serversNumber: newServersNumber,
            clusterStatus: 'Available',
            poolConnectedTo: null,
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
        const { clusterName, clusterDescription, clusterStatus } = req.body;

        const updatedCluster = await Cluster.findOneAndUpdate(
            { clusterId },
            { clusterName, clusterDescription, clusterStatus },
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


exports.removeServerFromClusterById = async (req, res) => {
    try {
        const clusterId = req.params.clusterId;
        const sendedServer = req.body;

        const findCluster = await Cluster.findOne({ _id: clusterId });
        console.log('findCluster:', findCluster);
        
        if (findCluster) {

            const newServers = findCluster.servers.filter(server => server.toString() !== sendedServer.server._id.toString());

            // const newServers = findCluster.servers.filter(server =>server._id !== sendedServer.server._id);
            findCluster.servers = newServers;
            findCluster.serversNumber = newServers.length;
            await findCluster.save();

            res.status(200).json({
                message: 'Server removed from cluster successfully and server list updated',
                cluster: findCluster
            });
        } else {
            res.status(404).json({ message: 'Cluster not found' });
        }
    } catch (error) {
        console.error('Error removing server from cluster:', error);
        res.status(500).json({
            message: 'Error removing server from cluster',
            error: error.message
        });
    }
};

exports.updateThePoolConnectedToByIp = async (req, res) => {
    try {
        const serverIp = req.params.serverIp;
        const { poolConnectedTo } = req.body;

        const updatedServer = await Server.findOneAndUpdate(
            { _id: serverIp },
            { poolConnectedTo },
            { new: true }
        );

        console.log('updatedServer:', updatedServer);

        if (updatedServer) {
            res.status(200).json({
                message: 'Pool connected to updated successfully',
                server: updatedServer
            });
        } else {
            res.status(404).json({ message: 'Server not found' });
        }
    } catch (error) {
        console.error('Error updating pool connected to:', error);
        res.status(500).json({
            message: 'Error updating pool connected to',
            error: error.message
        });
    }
};

exports.updateThePoolConnectedToById = async (req, res) => {
    try {
        console.log('req.params:', req.params);
        const clusterId = req.params.clusterId; // Change variable name to reflect cluster
        console.log('clusterId (req.params.clusterId):', clusterId);
        const { poolConnectedTo } = req.body; // Change field to poolConnectedTo\
        console.log('poolConnectedTo:', poolConnectedTo);

        const updatedCluster = await Cluster.findOneAndUpdate( // Change Server to Cluster
            { _id: clusterId },
            { poolConnectedTo }, // Update the poolConnectedTo field
            { new: true }
        );

        console.log('updatedCluster:', updatedCluster);

        if (updatedCluster) {
            res.status(200).json({
                message: 'Pool connected to updated successfully',
                cluster: updatedCluster // Change server to cluster in response
            });
        } else {
            res.status(404).json({ message: 'Cluster not found' }); // Change server to cluster in error message
        }
    } catch (error) {
        console.error('Error updating pool connected to:', error); // Change error message to pool
        res.status(500).json({
            message: 'Error updating pool connected to', // Change error message to pool
            error: error.message
        });
    }
};

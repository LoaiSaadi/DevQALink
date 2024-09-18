const Server = require('../../models/managementModels/serversModel');
const moment = require('moment-timezone');

exports.allServers = async (req, res) => {
    try {
        const servers = await Server.find();
        res.status(200).json(servers);
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({
            message: 'Error fetching servers',
            error: error.message
        });
    }
};

exports.addServer = async (req, res) => {
    try {
        const { serverIp, serverDescription, clusterConnectedTo } = req.body;

        // Get the current date and time in Jerusalem timezone
        const nowInJerusalem = moment().tz('Asia/Jerusalem');
        const createdDate = nowInJerusalem.format('YYYY-MM-DD');
        const createdTime = nowInJerusalem.format('HH:mm:ss');

        const newServer = new Server({
            serverIp,
            serverDescription,
            clusterConnectedTo: null,
            createdDate,
            createdTime
        });

        const savedServer = await newServer.save();

        res.status(201).json({
            message: 'Server added successfully',
            server: savedServer
        });
    } catch (error) {
        console.error('Error saving server:', error);
        res.status(500).json({
            message: 'Error saving server',
            error: error.message
        });
    }
};

exports.deleteServerById = async (req, res) => {
    try {
        const serverId = req.params.serverId;

        // Use findOneAndDelete to search by the serverId field and delete the document
        const deletedServer = await Server.findOneAndDelete({ serverId });
        console.log('deletedServer:', deletedServer);

        if (deletedServer) {
            res.status(200).json({
                message: 'Server deleted successfully',
                server: deletedServer
            });
        } else {
            res.status(404).json({ message: 'Server not found' });
        }
    } catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({
            message: 'Error deleting server',
            error: error.message
        });
    }
};

exports.updateServerById = async (req, res) => {
    try {
        const serverId = req.params.serverId;
        const { serverIp, serverDescription } = req.body;

        const updatedServer = await Server.findOneAndUpdate(
            { serverId },
            { serverIp, serverDescription },
            { new: true }
        );

        if (updatedServer) {
            res.status(200).json({
                message: 'Server updated successfully',
                server: updatedServer
            });
        } else {
            res.status(404).json({ message: 'Server not found' });
        }
    } catch (error) {
        console.error('Error updating server:', error);
        res.status(500).json({
            message: 'Error updating server',
            error: error.message
        });
    }
};

exports.updateTheClusterConnectedToByIp = async (req, res) => {
    try {
        console.log('updateTheClusterConnectedToByIp req.params:', req.params);
        const serverIp = req.params.serverIp;
        console.log('updateTheClusterConnectedToByIp serverIp:', serverIp);
        const { clusterConnectedTo } = req.body;
        console.log('updateTheClusterConnectedToByIp clusterConnectedTo:', clusterConnectedTo);

        const updatedServer = await Server.findOneAndUpdate(
            { _id: serverIp },
            { clusterConnectedTo },
            { new: true }
        );

        console.log('updatedServer:', updatedServer);

        if (updatedServer) {
            res.status(200).json({
                message: 'Cluster connected to updated successfully',
                server: updatedServer
            });
        } else {
            res.status(404).json({ message: 'Server not found' });
        }
    } catch (error) {
        console.error('Error updating cluster connected to:', error);
        res.status(500).json({
            message: 'Error updating cluster connected to',
            error: error.message
        });
    }
};

exports.updateIsTestRunnerServerByIp = async (req, res) => {
    try {
        const serverIp = req.params.clusterName;
        console.log('updateIsTestRunnerServerByIp :', serverIp);

        // Find the server by IP
        const server = await Server.findOne({ _id: serverIp});
        
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Flip the isTestRunnerServer boolean value
        const newIsTestRunner = !server.isTestRunner;

        // Update the server with the new boolean value
        const updatedServer = await Server.findOneAndUpdate(
            { _id: serverIp },
            { isTestRunner: newIsTestRunner },
            { new: true }
        );

        res.status(200).json({
            message: 'Test runner server updated successfully',
            server: updatedServer
        });
    } catch (error) {
        console.error('Error updating test runner server:', error);
        res.status(500).json({
            message: 'Error updating test runner server',
            error: error.message
        });
    }
};

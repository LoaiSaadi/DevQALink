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
            clusterConnectedTo: "-",
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
        const { serverIp, serverDescription, clusterConnectedTo } = req.body;

        const updatedServer = await Server.findOneAndUpdate(
            { serverId },
            { serverIp, serverDescription, clusterConnectedTo },
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
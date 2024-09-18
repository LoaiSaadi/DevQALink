const express = require('express');
const router = express.Router();
const serversController = require('../../controllers/managementControllers/serversController');

// GET request to list all servers
router.get('/allServers', serversController.allServers); // http://localhost:3000/management/servers/allServers
router.post('/addServer', serversController.addServer); // http://localhost:3000/management/servers/addServer
router.delete('/deleteServerById/:serverId', serversController.deleteServerById); // http://localhost:3000/management/servers/deleteServerById/:serverId
router.put('/updateServerById/:serverId', serversController.updateServerById); // http://localhost:3000/management/servers/updateServerById/:serverId
router.put('/updateTheClusterConnectedToByIp/:serverIp', serversController.updateTheClusterConnectedToByIp); // http://localhost:3000/management/servers/updateTheClusterConnectedToByIp/:serverIp
router.put('/updateIsTestRunnerServerByIp/:clusterName', serversController.updateIsTestRunnerServerByIp); // http://localhost:3000/management/servers/updateIsTestRunnerServerByIp/:serverIp

module.exports = router;

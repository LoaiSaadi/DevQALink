const express = require('express');
const router = express.Router();
const clustersController = require('../../controllers/managementControllers/clustersController');

// GET request to list all servers
router.get('/allClusters', clustersController.allClusters); // http://localhost:3000/management/clusters/allClusters
router.post('/addCluster', clustersController.addCluster); // http://localhost:3000/management/clusters/addCluster
router.delete('/deleteClusterById/:clusterId', clustersController.deleteClusterById); // http://localhost:3000/management/clusters/deleteClusterById/:clusterId
router.put('/updateClusterById/:clusterId', clustersController.updateClusterById); // http://localhost:3000/management/clusters/updateClusterById/:clusterId
router.put('/removeServerFromClusterById/:clusterId', clustersController.removeServerFromClusterById); // http://localhost:3000/management/clusters/removeServerFromClusterById/:clusterId

router.put('/updateThePoolConnectedToById/:clusterId', clustersController.updateThePoolConnectedToById); // http://localhost:3000/management/clusters/updateThePoolConnectedToById/:clusterId


module.exports = router;

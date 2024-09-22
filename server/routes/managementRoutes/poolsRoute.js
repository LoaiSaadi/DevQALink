const express = require('express');
const router = express.Router();
const poolsController = require('../../controllers/managementControllers/poolsController');

// GET request to list all pools
router.get('/allPools', poolsController.allPools); // http://localhost:3000/management/pools/allPools
router.post('/addPool', poolsController.addPool); // http://localhost:3000/management/pools/addPool
router.delete('/deletePoolById/:poolId', poolsController.deletePoolById); // http://localhost:3000/management/pools/deletePoolById/:poolId
router.put('/updatePoolById/:poolId', poolsController.updatePoolById); // http://localhost:3000/management/pools/updatePoolById/:poolId
router.put('/removeClusterFromPoolById/:poolId', poolsController.removeClusterFromPoolById); // http://localhost:3000/management/pools/removeClusterFromPoolById/:poolId
router.put('/freeCluster', poolsController.freeCluster); // http://localhost:3000/management/pools/freeCluster
router.put('/findClusterAndUpdate', poolsController.findClusterAndUpdate); // http://localhost:3000/management/pools/findClusterAndUpdate

module.exports = router;

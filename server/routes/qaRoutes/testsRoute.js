const express = require('express');
const router = express.Router();
const testsController = require('../../controllers/qaControllers/testsController');

// GET request to list all tests
router.get('/allTests', testsController.getAllTests); // http://localhost:3000/tests/allTests
router.post('/addTest', testsController.addTest); // http://localhost:3000/tests/addTest
router.delete('/deleteTestById/:testId', testsController.deleteTestById); // http://localhost:3000/tests/deleteTestById/:testId
router.put('/updateTestById/:testId', testsController.updateTestById); // http://localhost:3000/tests/updateTestById/:testId

module.exports = router;

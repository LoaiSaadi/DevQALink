const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authControllers/authController');

router.post('/login', authController.login); // http://localhost:3000/auth/login
router.post('/register', authController.register); // http://localhost:3000/auth/register

module.exports = router;

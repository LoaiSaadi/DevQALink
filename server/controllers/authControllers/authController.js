const express = require('express');
const bcrypt = require('bcrypt');  // For password hashing
const User = require('../../models/authModels/authModel'); // Assuming you have a User model
const router = express.Router();


// Login route
exports.login = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Find user by email or username
        const user = await User.findOne({ email, username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Authentication successful
        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


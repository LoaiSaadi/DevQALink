const express = require('express');
const bcrypt = require('bcrypt');  // For password hashing
const User = require('../../models/authModels/authModel'); // Assuming you have a User model
const router = express.Router();
const jwt = require('jsonwebtoken');


// Login route
exports.login = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Find user by email or username
        // const user = await User.findOne({ email, username });
        const user = await User.findOne({
            $or: [{ email: email }, { username: username }]
        });
        console.log('user:', user); 
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Authentication successful
        var token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        // res.json({ message: 'Login successful', user });
        res.json({
            message: 'Login successful',
            token: token,  // Send the JWT token
            user: {
                id: user._id,
                email: user.email,
                username: user.username
                // Add any additional user data as needed
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Register route
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error, try again later' });
    }
};
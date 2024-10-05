// src/pages/Landing/Landing.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css'; // Import the CSS file

const Landing = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleRegisterClick = () => {
        navigate('/register'); // You can implement this later
    };

    return (
        <div className="landing-container">
            <div className="overlay">
                <h1>Welcome to DevQALink</h1>
                <p>Automated QA and Dev Build Scheduling Framework</p>
                <div className="button-container">
                    <button onClick={handleLoginClick} className="landing-button login">Login</button>
                    <button onClick={handleRegisterClick} className="landing-button register">Register</button>
                </div>
            </div>
        </div>
    );
};

export default Landing;

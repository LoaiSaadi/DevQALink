// src/pages/Auth/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Use the same CSS as Auth

const Register = () => {
    
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Registration successful. Please login to continue.');
                navigate('/login'); // Redirect to login after successful registration
            } else {
                const data = await response.json();
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="overlay">
                <h2>Register</h2>
                {error && <p className="error-message">{error}</p>}
                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="button-container">
                        <button type="submit" className="auth-button login">
                            Register
                        </button>
                        <button
                            type="button"
                            className="auth-button back"
                            onClick={() => navigate('/')}
                        >
                            Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;

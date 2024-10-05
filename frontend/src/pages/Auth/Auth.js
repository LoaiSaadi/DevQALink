import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Import the CSS for styling

const Auth = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state to toggle password visibility
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert(`Login successful to @${username}`);

                // Save username to localStorage
                localStorage.setItem('username', username);

                // Check if the token is present in the response and store it
                if (data.token) {
                    localStorage.setItem('token', data.token); // Store the JWT token
                }

                navigate('/home'); // Navigate to home
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            setError('An error occurred, please try again.');
        }
    };

    const handleBackClick = () => {
        navigate('/'); // Navigate back to the Landing page
    };

    return (
        <div className="auth-container">
            <div className="overlay">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email or Username</label>
                        <input
                            type="text"
                            value={email || username}
                            onChange={(e) => setEmail(e.target.value) || setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'} // Conditionally set the input type
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                            Show Password
                        </label>
                    </div>
                    <div className="button-container">
                        <button type="submit" className="auth-button login">Login</button>
                        <button type="button" onClick={handleBackClick} className="auth-button back">Back</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;

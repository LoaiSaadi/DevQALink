// SessionTimer.js
import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is imported

const SessionTimer = () => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false); // Flag to track if session has expired

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // Decode the JWT token to get its expiration time
            const decoded = jwtDecode(token);
            const timeUntilExpiry = decoded.exp - Date.now() / 1000; // Remaining time in seconds

            if (timeUntilExpiry > 0) {
                setTimeLeft(timeUntilExpiry); // Set the countdown timer

                // Reset the timer whenever user interacts (mousemove, keydown, click, scroll)
                const resetTimer = () => {
                    setTimeLeft(timeUntilExpiry); // Reset timer to full expiration time
                    setSessionExpired(false); // Reset session expired flag
                };

                // Add event listeners for activity
                window.addEventListener('mousemove', resetTimer);
                window.addEventListener('keydown', resetTimer);
                window.addEventListener('click', resetTimer);
                window.addEventListener('scroll', resetTimer);

                // Start the countdown
                const countdown = setInterval(() => {
                    setTimeLeft((prevTime) => {
                        if (prevTime <= 1) {
                            clearInterval(countdown);
                            handleTokenExpiry(); // Call token expiry only if not already expired
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);

                // Clean up the listeners when component unmounts
                return () => {
                    clearInterval(countdown);
                    window.removeEventListener('mousemove', resetTimer);
                    window.removeEventListener('keydown', resetTimer);
                    window.removeEventListener('click', resetTimer);
                    window.removeEventListener('scroll', resetTimer);
                };
            } else {
                // Token already expired
                handleTokenExpiry();
            }
        } else {
            alert('No token found, redirecting to login.');
            window.location.href = '/login'; // Redirect to login
        }
    }, []);

    const handleTokenExpiry = () => {
        if (!sessionExpired) {
            setSessionExpired(true); // Set the flag to true to prevent multiple alerts
            alert('Session expired due to inactivity. Please log in again.'); // Alert for session expiry
            localStorage.removeItem('token'); // Remove token
            window.location.href = '/login'; // Redirect to login
        }
    };

    return (
        <div>
            {timeLeft !== null && (
                <p>Session will expire after inactivity in: {timeLeft} seconds</p>
            )}
        </div>
    );
};

export default SessionTimer;

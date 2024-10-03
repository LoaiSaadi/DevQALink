import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is imported
import './Home.css'; // Assuming you will create a CSS file for styling
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const Home = () => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false); // Flag to track if session has expired
    const navigate = useNavigate(); // Initialize useNavigate hook


    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // Decode the JWT token to get its expiration time
            const decoded = jwtDecode(token);
            console.log('Current time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })); // Display current time in Jerusalem time
            
            // Calculate the expiration time based on the decoded token
            const expirationTime = new Date(decoded.exp * 1000); // Convert seconds to milliseconds
            console.log('Token expiry time:', expirationTime.toString());

            const timeUntilExpiry = (decoded.exp * 1000 - Date.now()) / 1000; // Remaining time in seconds
            console.log('Time until expiry:', timeUntilExpiry);

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
                        console.log(`Time left: ${prevTime} seconds`); // Log time left
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
    }, []); // Run this effect only once when the component mounts

    const handleTokenExpiry = () => {
        if (!sessionExpired) {
            setSessionExpired(true); // Set the flag to true to prevent multiple alerts
            alert('Session expired due to inactivity. Please log in again.'); // Alert for session expiry
            localStorage.removeItem('token'); // Remove token
            window.location.href = '/login'; // Redirect to login
        }
    };

    // Handler for navigation on click
    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="home-container">
            <h1 className="title">Welcome to the QA and Dev Scheduling Framework</h1>
            <p className="intro">
                Bridging the gap between QA and Development teams through a robust scheduling system for automated testing. This project is full of dummy data to simulate the environment.
            </p>
            
            <section className="entity">
                <h2 className="entity-title">Key Entities</h2>
                
                <div className="qa-tests">
                    <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/qa')}>🧪 QA Tests</h3>
                    <p>
                        QA testers define their tests with titles, descriptions, and steps. Tests can be created using different programming languages such as Ruby, C#, Java, JavaScript, Python, and more. Users can simply add their code snippets for the tests. An automated test trigger, represented as a command line (e.g., <code>python3.9 test_runner.py --arg1 value1 --arg2 value2</code>), allows seamless execution of tests.
                    </p>
                </div>

                <div className="dev-builds">
                    <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/builds')}>📦 Dev Builds</h3> {/* Added cursor styling for pointer */}
                    <p>
                        Users can view application versions and builds, including released and in-progress versions. This information is fetched from a third-party application. The project uses dummy data, with daily updates on the latest builds (e.g., version-build 1.0.0-100 today, 1.0.0-101 tomorrow).
                    </p>
                </div>

                <div className="resources">
                    <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/resources')}>🏗️ Resources</h3>
                    <p>
                        Resources are crucial for running QA tests on dev builds and are structured as follows:
                    </p>
                    <ul>
                        <li><strong>Pool:</strong> Contains sets of clusters.</li>
                        <li><strong>Cluster:</strong> Comprises sets of servers.</li>
                        <li><strong>Server:</strong> Identified by its IP address.</li>
                    </ul>
                    <p>
                        Users can designate one server in a cluster as the test runner, responsible for triggering automated tests. Additionally, each server, cluster, and pool are interconnected to ensure seamless communication and resource allocation. This section also uses dummy data for demonstration.
                    </p>
                </div>

                <div className="scheduler">
                    <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/jobs')}>🗓️ Scheduler</h3>
                    <p>
                        Users can define jobs to trigger test runs on dev builds using specific resources. Jobs can be one-time or recurring, with management options available for active jobs. Each job is assigned a priority from 1 (lowest) to 10 (highest), and a scheduling algorithm ensures optimal job execution.
                    </p>
                </div>

                <div className="executions">
                    <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/jobs')}>📊 Executions</h3>
                    <p>
                        The execution page tracks active jobs and their progress. Pools and clusters reflect their availability, with job status updates in real-time. Jobs run randomly for 40 to 50 seconds, as this is dummy data, simulating the actual execution time.
                    </p>
                </div>

                <div className="reports">
                    <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/reports')}>📄 Reports</h3>
                    <p>
                        After job execution, detailed reports are generated, including test results, failure reasons, and runtime duration. An optional feature allows users to open bug tickets using third-party applications like Jira.
                    </p>
                </div>
            </section>

            <footer className="footer">
                <p>© {new Date().getFullYear()} QA and Dev Scheduling Framework. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;

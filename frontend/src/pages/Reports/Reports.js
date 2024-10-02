import './Reports.css'; // Assuming you will add styles in an external CSS file
import React, { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is imported


const fetchCompletedJobsData = async () => {
    try {
        const response = await fetch('http://localhost:3000/jobs/completedJobs/allCompletedJobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching completed jobs data:', error);
        throw error;
    }
};

const Reports = () => {
    const [completedJobs, setCompletedJobs] = useState([]);
    const [successfulJobsByPool, setSuccessfulJobsByPool] = useState([]);
    const [successfulJobsByUser, setSuccessfulJobsByUser] = useState({}); // New state for user distribution
    const [openedBugs, setOpenedBugs] = useState({}); // State to track opened bugs
    const [sentReports, setSentReports] = useState({}); // State to track sent reports

    const [timeLeft, setTimeLeft] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false); // Flag to track if session has expired

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

    // Fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const completedJobsData = await fetchCompletedJobsData();
                setCompletedJobs(completedJobsData);

                // Count successful jobs
                const successfulJobsCount = {};
                const successfulJobsPerUser = {};

                completedJobsData.forEach((job) => {
                    if (job.testStatus === 'Succeeded') {
                        const poolName = job.resourcePool; // Use resourcePool to get the Pool name
                        const clusterName = job.runnedOnCluster; // Use runnedOnCluster to get the Cluster name

                        // Check if the pool and cluster exist in the initialized counts
                        if (successfulJobsCount[poolName]) {
                            if (successfulJobsCount[poolName][clusterName]) {
                                successfulJobsCount[poolName][clusterName]++;
                            } else {
                                successfulJobsCount[poolName] = { ...successfulJobsCount[poolName], [clusterName]: 1 };
                            }
                        } else {
                            successfulJobsCount[poolName] = { [clusterName]: 1 };
                        }

                        // Count successful jobs by user
                        const userName = job.triggeredBy; // Use the triggeredBy field to get the user name
                        if (successfulJobsPerUser[userName]) {
                            successfulJobsPerUser[userName]++;
                        } else {
                            successfulJobsPerUser[userName] = 1; // Initialize the count for this user
                        }
                    }
                });

                console.log('Successful jobs by pool:', successfulJobsCount);
                console.log('Successful jobs by user:', successfulJobsPerUser);
                setSuccessfulJobsByPool(successfulJobsCount);
                setSuccessfulJobsByUser(successfulJobsPerUser); // Set the successful jobs count per user

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Get all unique clusters (C1, C2, C3, etc.)
    const clusters = [...new Set(Object.values(successfulJobsByPool).flatMap(pool => Object.keys(pool)))];

    // Create the series data for each cluster
    const series = clusters.map(cluster => {
        return {
            label: cluster,  // Cluster name (C1, C2, etc.)
            data: Object.keys(successfulJobsByPool).map(pool => {
                return successfulJobsByPool[pool][cluster] || 0;  // Value for each pool or 0 if not present
            })
        };
    });

    const labels = Object.keys(successfulJobsByPool);

    // Summing up the values for PieChart data (SSD, HDD, SSHD)
    const pieChartPoolData = Object.keys(successfulJobsByPool).map((poolName) => {
        const totalCount = Object.values(successfulJobsByPool[poolName]).reduce((acc, val) => acc + val, 0);
        return { id: poolName, value: totalCount, label: poolName };
    });

    // Create the series data for User Distribution PieChart
    const pieChartUserData = Object.keys(successfulJobsByUser).map(userName => ({
        id: userName,
        value: successfulJobsByUser[userName],
        label: userName
    }));

    // Update openBug to accept the job object
    const openBug = async (job) => {
        try {
            const response = await fetch(`http://localhost:3000/reports/jira/openBug`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(job), // Send the whole job object
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Jira issue created successfully with ID: ${data.issueKey}`);

                // Mark the bug as opened for this job
                setOpenedBugs((prev) => ({ ...prev, [job.jobId]: true }));
            } else {
                alert('Failed to create Jira issue');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the Jira issue.');
        }
    };

    const sendReportToUser = async (job) => {
        try {
            const response = await fetch(`http://localhost:3000/reports/sendReport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ job })  // Pass job object
            });

            if (response.ok) {
                alert(`Report sent successfully to ${job.triggeredBy}`);

                // Mark the report as sent for this job
                setSentReports((prev) => ({ ...prev, [job.jobId]: true }));
            } else {
                alert('Failed to send the report');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the report.');
        }
    };

    return (
        <div className="reports-container">
            <h1>Reports</h1>

            <p style={{ fontSize: '1.2em' }}>Overview of resource pool usage and job performance.</p>

            <div className="separator" />

            <h2>Pools Usage</h2>
            <p style={{ fontSize: '1.2em' }}>Successful jobs distributed across resource pools and clusters</p>

            <BarChart
                series={series} 
                height={450}
                xAxis={[{ data: labels, scaleType: 'band' }]} 
                margin={{ top: 70, bottom: 30, left: 40, right: 10 }}
            />

            <div className="separator" />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ flex: 1, marginRight: '80px' }}>
                    <h2>Pools Distribution</h2>
                    <p style={{ fontSize: '1.2em' }}>Successful jobs by resource pool</p>
                    <PieChart
                        series={[{
                            data: pieChartPoolData,
                        }]}
                        width={400}
                        height={200}
                    />
                </div>

                <div style={{ flex: 1, marginLeft: '80px' }}>
                    <h2>Users Distribution</h2>
                    <p style={{ fontSize: '1.2em' }}>Successful jobs per user</p>
                    <PieChart
                        series={[{
                            data: pieChartUserData,
                        }]}
                        width={400}
                        height={200}
                    />
                </div>
            </div>

            <div className="separator" />

            <h2>Jobs Reports</h2>
            <p style={{ fontSize: '1.2em' }}>Detailed reports of job status and failure reasons.</p>
            <div className="cards-container">
                {completedJobs.map((job, index) => (
                    <div key={index} className="report-card">
                        <h3>Job {job.jobId} Report</h3>
                        <p><strong>Job: </strong> {job.jobName}</p>
                        <p><strong>Version-Build: </strong> {job.buildVersion}</p>
                        <p><strong>Cluster Details: </strong> {job.runnedOnCluster}</p>
                        <p><strong>Test Result: </strong>
                            <span className={`status ${job.testStatus}`} style={{ color: job.testStatus === 'Succeeded' ? 'green' : 'red' }}>
                                {job.testStatus}
                            </span>
                        </p>
                        <p><strong>Failure Reason: </strong>{job.failureReason}</p>
                        <p><strong>Runtime Duration: </strong> {job.duration}</p>
                        <p><strong>Date: </strong> {job.completedDate}</p>
                        <p><strong>Triggered By: </strong> {job.triggeredBy}</p>

                        <button 
                            className="open-bug-btn" 
                            onClick={() => openBug(job)} 
                            disabled={openedBugs[job.jobId] || false}
                        >
                            {openedBugs[job.jobId] ? 'Bug Opened' : 'Open Bug'}
                        </button>

                        <button 
                            className="send-report-btn" 
                            onClick={() => sendReportToUser(job)} 
                            disabled={sentReports[job.jobId] || false}  // Disable if report is already sent
                        >
                            {sentReports[job.jobId] ? 'Report Sent' : 'Send Report'}
                        </button>
                    </div>
                ))}
            </div>

            <footer className="footer">
                <p>© {new Date().getFullYear()} QA and Dev Scheduling Framework. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Reports;

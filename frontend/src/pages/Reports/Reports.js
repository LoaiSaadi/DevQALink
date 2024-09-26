import './Reports.css'; // Assuming you will add styles in an external CSS file
import React, { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';



// Simulated array of users
const users = ['User 1', 'User 2', 'User 3', 'User 4', 'User 5'];



// Function to randomly pick a user from the array
const getRandomUser = () => {
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
};

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

    // Fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const completedJobsData = await fetchCompletedJobsData();
                setCompletedJobs(completedJobsData);

                // Count successful jobs
                const successfulJobsCount = {};

                completedJobsData.forEach((job) => {
                    if (job.testStatus === 'Succeeded') {
                        const poolName = job.resourcePool; // Use resourcePool to get the Pool name
                        const clusterName = job.runnedOnCluster; // Use runnedOnCluster to get the Cluster name

                        // Check if the pool and cluster exist in the initialized counts
                        if (successfulJobsCount[poolName]) {
                            if (successfulJobsCount[poolName][clusterName]) {
                                successfulJobsCount[poolName][clusterName]++;
                            }
                            else {
                                successfulJobsCount[poolName] = { ...successfulJobsCount[poolName], [clusterName]: 1 };
                            }
                        } else {
                            successfulJobsCount[poolName] = { [clusterName]: 1 };
                        }
                    }
                });

                console.log("successfulJobsCount: ", successfulJobsCount);
                setSuccessfulJobsByPool(successfulJobsCount);
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
    console.log("series: ", series);
    const labels = Object.keys(successfulJobsByPool);

    // Summing up the values for PieChart data (SSD, HDD, SSHD)
    const pieChartData = Object.keys(successfulJobsByPool).map((poolName) => {
        const totalCount = Object.values(successfulJobsByPool[poolName]).reduce((acc, val) => acc + val, 0);
        return { id: poolName, value: totalCount, label: poolName };
    });

    // Calculate total value
    const totalValue = pieChartData.reduce((acc, item) => acc + item.value, 0);

    // Prepare data for the PieChart with calculated percentages as values
    const formattedData = pieChartData.map(item => ({
        ...item,
        value: ((item.value / totalValue) * 100).toFixed(2) // Update value to be the percentage
    }));
    console.log("formattedData: ", formattedData);

    return (
        <div className="reports-container">
            <h1>Reports</h1>
            
            <p style={{ fontSize: '1.2em' }}>Overview of resource pool usage and job performance.</p>

            <div className="separator" />
            

            <h2>Pools Usage</h2>
            <p style={{ fontSize: '1.2em' }}>Successful jobs distributed across resource pools and clusters.</p>

            <BarChart
                series={series}  // Dynamically generated series
                height={400}
                xAxis={[{ data: labels, scaleType: 'band' }]}  // Pool names (HDD, SSD, SSHD)
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            />

            <div className="separator" />

            <h2>Pool Distribution</h2>
            <p style={{ fontSize: '1.2em' }}>Summary of successful jobs per resource pool.</p>
            <PieChart
                series={[{
                    data: formattedData,
                }]}
                width={400}
                height={200}
            />
            
            <div className="separator" />

            <h2>Jobs Reports</h2>
            <p style={{ fontSize: '1.2em' }}>Detailed reports of job status and failure reasons.</p>
            <div className="cards-container">
                {completedJobs.map((job, index) => (
                    <div key={index} className="report-card">
                        <h3>Job .{job.jobId} Report</h3>
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
                        <p><strong>Triggered By: </strong> {getRandomUser()}</p>

                        <button className="open-bug-btn" onClick={() => openBug(job)}>Open Bug</button>
                        <button className="send-report-btn" onClick={() => sendReportToUser(getRandomUser())}>Send Report</button>
                    </div>
                ))}
            </div>

            <footer className="footer">
                <p>© {new Date().getFullYear()} QA and Dev Scheduling Framework. All rights reserved.</p>
            </footer>
        </div>
    );
};

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
        } else {
            alert('Failed to create Jira issue');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating the Jira issue.');
    }
};

const sendReportToUser = (user) => {
    alert(`Sending report to ${user}`);
    // Implement logic to send report to the user
};

export default Reports;

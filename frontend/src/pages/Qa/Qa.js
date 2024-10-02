// src/components/Qa.js
import React, { useState, useEffect } from 'react';
import './Qa.css'; // Add styling as needed
import EditTestForm from './EditTestForm'; // Import EditTestForm for editing tests
import TestForm from './TestForm'; // Import TestForm for adding new tests
import DeleteTestForm from './DeleteTestForm'; // Import DeleteTestForm for deleting tests
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is imported


const fetchTestsData = async () => {
    try {
        const response = await fetch('http://localhost:3000/tests/allTests');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tests data:', error);
        throw error;
    }
};

const Qa = () => {
    const [tests, setTests] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(true); // New state to differentiate form type
    const [editingTest, setEditingTest] = useState(null);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false); // State for delete form
    const [testToDelete, setTestToDelete] = useState(null); // State to store the test to delete

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const testsData = await fetchTestsData();
                setTests(testsData);
            } catch (error) {
                console.error('Error fetching test data:', error);
            }
        };

        fetchData();
    }, []);

    const openForm = () => {
        setIsAdding(true); // Set form type to add
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setIsAdding(true); // Reset to add mode
        setEditingTest(null);
        setIsDeleteFormOpen(false); // Close delete form
        setTestToDelete(null); // Reset test to delete
    };

    const openEditForm = (test) => {
        setEditingTest(test);
        setIsAdding(false); // Set form type to edit
        setIsFormOpen(true);
    };

    const openDeleteForm = (test) => {
        setTestToDelete(test);
        setIsDeleteFormOpen(true); // Open delete form
    };

    const handleDelete = async () => {
        console.log('Deleting test:', testToDelete);
        try {
            const updatedTests = await fetchTestsData();
            setTests(updatedTests);
        }
        catch (error) {
            console.error('Error handling deleted test:', error);
        }
    };

    const handleTestUpdated = async (updatedTest) => {
        try {
            const updatedTests = await fetchTestsData();
            setTests(updatedTests);
        } catch (error) {
            console.error('Error handling updated test:', error);
        }
    };

    const handleTestAdded = async (newTest) => {
        console.log('Trying to show:', newTest);
        try {
            const updatedTests = await fetchTestsData();
            setTests(updatedTests);
        } catch (error) {
            console.error('Error handling added test:', error);
        }
    };

    return (
        <div className="qa-container">
            <h1>QA Testers</h1>
            <p style={{ fontSize: '1.2em' }}>This section manages the QA testing process.</p>
            <div className="separator" /> {/* Separator after QA Testers description */}
            
            <h2>Tests</h2>
            <p style={{ fontSize: '1.2em' }}>Here you can add, edit, or delete tests.</p>
            
            <button onClick={openForm}>Add Test</button>
            {isFormOpen && (
                isAdding ? (
                    <TestForm
                        closeForm={closeForm}
                        onTestAdded={handleTestAdded} // Handler for saving new tests
                    />
                ) : (
                    <EditTestForm
                        test={editingTest} // Passing the test object for editing
                        closeForm={closeForm}
                        saveTest={handleTestUpdated} // Handler for saving updates
                    />
                )
            )}
            {isDeleteFormOpen && (
                <DeleteTestForm
                    test={testToDelete}
                    closeForm={closeForm}
                    deleteTest={handleDelete} // Handler for deleting tests
                />
            )}

            <table className="tests-table">
                <thead>
                    <tr>
                        <th>Test ID</th>
                        <th>Test Title</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.map(test => (
                        <tr key={test.testId}>
                            <td>{test.testId}</td>
                            <td>{test.testTitle}</td>
                            <td>{test.testDescription}</td>
                            <td>{test.saveAs}</td>
                            <td>
                                <button className='action-btn edit-btn' onClick={() => openEditForm(test)}>Edit</button>
                            </td>
                            <td>
                                <button className="action-btn delete-btn" onClick={() => openDeleteForm(test)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <footer className="footer">
                <p>© {new Date().getFullYear()} QA and Dev Scheduling Framework. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Qa;

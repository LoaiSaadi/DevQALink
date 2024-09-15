// src/components/Qa.js
import React, { useState, useEffect } from 'react';
import './Qa.css'; // Add styling as needed
import EditTestForm from './EditTestForm'; // Import EditTestForm for editing tests
import TestForm from './TestForm'; // Import TestForm for adding new tests
import DeleteTestForm from './DeleteTestForm'; // Import DeleteTestForm for deleting tests

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
        console.log('Tring to show :', newTest);
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

            <h2>Tests</h2>
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
        </div>
    );
};

export default Qa;

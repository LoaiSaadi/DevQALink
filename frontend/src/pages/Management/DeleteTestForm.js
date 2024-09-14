import React, { useEffect, useRef } from 'react';
import './DeleteTestForm.css'; // Make sure to update the CSS file name if needed

const DeleteTestForm = ({ test, closeForm, deleteTest }) => {
    const formRef = useRef(null);

    // Function to handle the delete operation
    const handleDelete = async () => {
        try {
            // Sending a DELETE request to the server
            const response = await fetch(`http://localhost:3000/tests/deleteTestById/${test.testId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result.message); // Log the success message (optional)

            deleteTest(test.testId); // Update the parent component's state by removing the test
            closeForm(); // Close the form after deletion
        } catch (error) {
            console.error('Error deleting test:', error);
        }
    };

    // Close the form if clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (formRef.current && !formRef.current.contains(e.target)) {
                closeForm();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeForm]);

    return (
        <div className="form-overlay">
            <div className="form-card" ref={formRef}>
                <button className="close-btn" onClick={closeForm}>&times;</button>
                <h2>Delete Test</h2>
                <p>Are you sure you want to delete the test "{test.testTitle}"?</p>
                <div className="btn-container">
                    <button className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button className="cancel-btn" onClick={closeForm}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTestForm;

import React, { useEffect, useRef } from 'react';
import './DeletePoolForm.css'; // Make sure to update the CSS file name if needed

const DeletePoolForm = ({ pool, closeForm, deletePool }) => {
    const formRef = useRef(null);

    // Function to handle the delete operation
    const handleDelete = async () => {
        try {
            if (pool.poolStatus === 'Available') {
                // Sending a DELETE request to the pool
                const response = await fetch(`http://localhost:3000/management/pools/deletePoolById/${pool.poolId}`, {
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

                // deletePool(pool.poolId); // Update the parent component's state by removing the pool
                deletePool(pool); // Update the parent component's state by removing the pool
                closeForm(); // Close the form after deletion
            }
            else {
                alert('Please try again later. The pool is running or unavailable.');
                return; // Exit the function without submitting the form
            }
        } catch (error) {
            console.error('Error deleting pool:', error);
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
                <h2>Delete Pool</h2>
                <p>Are you sure you want to delete the pool "{pool.poolName}"?</p>
                <div className="btn-container">
                    <button className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button className="cancel-btn" onClick={closeForm}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeletePoolForm;

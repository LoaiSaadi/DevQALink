import React, { useEffect, useRef } from 'react';

import './DeleteJobForm.css';

const DeleteJobForm = ({ job, closeForm, deleteJob }) => {
    const formRef = useRef(null);

    // Function to handle the delete operation
    const handleDelete = async () => {
        try {
            let response = null;
            // Sending a DELETE request to the server
            if (job.status === 'Waiting') {
                response = await fetch(`http://localhost:3000/jobs/waitingJobs/deleteJobById/${job.jobId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            if (job.status === 'Ready') {
                response = await fetch(`http://localhost:3000/jobs/readyJobs/deleteJobById/${job.jobId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result.message); // Log the success message (optional)

            deleteJob(job.jobId); // Update the parent component's state by removing the job
            closeForm(); // Close the form after deletion
        } catch (error) {
            console.error('Error deleting job:', error);
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
                <h2>Delete Job</h2>
                <p>Are you sure you want to delete the job "{job.jobName}"?</p>
                <div className="btn-container">
                    <button className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button className="cancel-btn" onClick={closeForm}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteJobForm;

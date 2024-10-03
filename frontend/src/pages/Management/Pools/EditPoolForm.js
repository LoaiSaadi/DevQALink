import React, { useState, useEffect, useRef } from 'react';
import './EditPoolForm.css';

const EditPoolForm = ({ pool = {}, closeForm, savePool }) => {
    console.log('EditPoolForm pool:', pool);

    // Initialize form data with the existing pool data
    const [formData, setFormData] = useState({
        poolName: pool.poolName || '',
        poolDescription: pool.poolDescription || '',
        poolStatus: pool.poolStatus || 'Available',
        clusters: pool.clusters || [],  // Array of selected cluster objects
        clustersNumber: pool.clustersNumber || 0,
        serversNumber: pool.serversNumber || 0,
        createdDate: pool.createdDate || new Date().toISOString().split('T')[0],  // Set default date to today's date
        createdTime: pool.createdTime || new Date().toLocaleTimeString('en-GB', { hour12: false }),  // Set default time to current time
    });

    const formRef = useRef(null);

    // Handle form data changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Ensure required fields are not empty
        if (!formData.poolName || !formData.poolDescription) {
            alert('Please fill out all required fields.');
            return;
        }

        const poolData = { ...formData };

        try {
            const response = await fetch(`http://localhost:3000/management/pools/updatePoolById/${pool.poolId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(poolData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Pool updated successfully:', result.pool);

                if (savePool) {
                    savePool(result.pool);
                }

                closeForm();
            } else {
                console.error('Failed to update pool:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while updating pool:', error);
        }
    };

    // Close the form if the user clicks outside of it
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
                <form className="form-container" onSubmit={handleSubmit}>
                    <h2>Edit Pool</h2>

                    <div className="form-row">
                        <label htmlFor="poolName">Pool Name</label>
                        <input
                            type="text"
                            id="poolName"
                            name="poolName"
                            value={formData.poolName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="poolDescription">Pool Description</label>
                        <input
                            type="text"
                            id="poolDescription"
                            name="poolDescription"
                            value={formData.poolDescription}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="poolStatus">Pool Status</label>
                        <select
                            id="poolStatus"
                            name="poolStatus"
                            value={formData.poolStatus}
                            onChange={handleChange}
                            required
                        >
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                            <option disabled value="Running">Running</option>
                        </select>
                    </div>

                    <div className="btn-container">
                        <button type="submit" className="submit-btn">Save Changes</button>
                        <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPoolForm;

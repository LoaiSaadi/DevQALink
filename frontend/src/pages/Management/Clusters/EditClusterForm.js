import React, { useState, useEffect, useRef } from 'react';
import './EditClusterForm.css';

const EditClusterForm = ({ cluster = {}, closeForm, saveCluster }) => {
    console.log('EditClusterForm cluster:', cluster);

    // Initialize form data with the existing cluster data
    const [formData, setFormData] = useState({
        clusterName: cluster.clusterName || '',
        clusterDescription: cluster.clusterDescription || '',
        clusterStatus: cluster.clusterStatus || 'Available',
        poolConnectedTo: cluster.poolConnectedTo || '',
        servers: cluster.servers || [],  // Array of selected server objects
        testRunnerServer: cluster.testRunnerServer || '',  // Selected test runner server object
        createdDate: cluster.createdDate || new Date().toISOString().split('T')[0],
        createdTime: cluster.createdTime || new Date().toLocaleTimeString('en-GB', { hour12: false }),
    });

    // const [availableServers, setAvailableServers] = useState([]); // Available servers for selection
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
        if (!formData.clusterName || !formData.clusterDescription || !formData.testRunnerServer || !formData.createdDate || !formData.createdTime) {
            alert('Please fill out all required fields.');
            return;
        }

        const clusterData = { ...formData };

        try {
            const response = await fetch(`http://localhost:3000/management/clusters/updateClusterById/${cluster.clusterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clusterData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Cluster updated successfully:', result.cluster);

                if (saveCluster) {
                    saveCluster(result.cluster);
                }

                closeForm();
            } else {
                console.error('Failed to update cluster:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while updating cluster:', error);
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
                    <h2>Edit Cluster</h2>

                    <div className="form-row">
                        <label htmlFor="clusterName">Cluster Name</label>
                        <input
                            type="text"
                            id="clusterName"
                            name="clusterName"
                            value={formData.clusterName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="clusterDescription">Cluster Description</label>
                        <input
                            type="text"
                            id="clusterDescription"
                            name="clusterDescription"
                            value={formData.clusterDescription}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="clusterStatus">Cluster Status</label>
                        <select
                            id="clusterStatus"
                            name="clusterStatus"
                            value={formData.clusterStatus}
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

export default EditClusterForm;

import React, { useState, useEffect, useRef } from 'react';
import './EditClusterForm.css';

const EditClusterForm = ({ cluster = {}, closeForm, saveCluster }) => {
    console.log('EditClusterForm cluster:', cluster);

    // Initialize form data
    const [formData, setFormData] = useState({
        clusterName: cluster.clusterName || '',
        clusterDescription: cluster.clusterDescription || '',
        clusterStatus: cluster.clusterStatus || 'Available',
        servers: cluster.servers || [],  // Array of Object IDs
        testRunnerServer: cluster.testRunnerServer || '',  // Object ID
        createdDate: cluster.createdDate || '',
        createdTime: cluster.createdTime || '',
    });

    const formRef = useRef(null);

    // Handle form data changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation: Ensure required fields are not empty
        if (!formData.clusterName || !formData.clusterDescription || !formData.createdDate || !formData.createdTime) {
            alert('Please fill out all required fields.');
            return; // Exit the function without submitting the form
        }

        const clusterData = {
            ...formData
        };

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
                console.log('Cluster updated successfully!');
                console.log('Cluster ID:', result.cluster._id);

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

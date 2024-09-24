import React, { useEffect, useRef } from 'react';
import './DeleteClusterForm.css'; // Make sure to update the CSS file name if needed

const DeleteClusterForm = ({ cluster, closeForm, deleteCluster }) => {
    const formRef = useRef(null);

    // Function to handle the delete operation
    const handleDelete = async () => {
        try {
            if (cluster.clusterStatus === 'Available') {
                if (cluster.poolConnectedTo != null) {
                    const response = await fetch(`http://localhost:3000/management/pools/removeClusterFromPoolById/${cluster.poolConnectedTo}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ cluster })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }

                // Sending a DELETE request to the cluster
                const response = await fetch(`http://localhost:3000/management/clusters/deleteClusterById/${cluster.clusterId}`, {
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

                // deleteCluster(cluster.clusterId); // Update the parent component's state by removing the cluster
                deleteCluster(cluster); // Update the parent component's state by removing the cluster
                closeForm(); // Close the form after deletion
            }
            else {
                alert('Please try again later. The cluster is running or unavailable.');
                return; // Exit the function without submitting the form
            }
                
        } catch (error) {
            console.error('Error deleting cluster:', error);
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
                <h2>Delete Cluster</h2>
                <p>Are you sure you want to delete the cluster "{cluster.clusterName}"?</p>
                <div className="btn-container">
                    <button className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button className="cancel-btn" onClick={closeForm}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteClusterForm;

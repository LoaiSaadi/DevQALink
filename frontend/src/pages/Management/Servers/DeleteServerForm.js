import React, { useEffect, useRef } from 'react';
import './DeleteServerForm.css'; // Make sure to update the CSS file name if needed

const DeleteServerForm = ({ server, closeForm, deleteServer }) => {
    const formRef = useRef(null);

    // Function to handle the delete operation
    const handleDelete = async () => {
        try {
            if (server.clusterConnectedTo != null) {
                const response = await fetch(`http://localhost:3000/management/clusters/removeServerFromClusterById/${server.clusterConnectedTo}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ server })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            if (!server.isTestRunner) {
                // Sending a DELETE request to the server
                const response = await fetch(`http://localhost:3000/management/servers/deleteServerById/${server.serverId}`, {
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
            }
            else {
                alert('Please select a valid server. The server is server runner.');
                return; // Exit the function without submitting the form
            }

            deleteServer(server.serverId); // Update the parent component's state by removing the server
            closeForm(); // Close the form after deletion

        } catch (error) {
            console.error('Error deleting server:', error);
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
                <h2>Delete Server</h2>
                <p>Are you sure you want to delete the server "{server.serverIp}"?</p>
                <div className="btn-container">
                    <button className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button className="cancel-btn" onClick={closeForm}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteServerForm;

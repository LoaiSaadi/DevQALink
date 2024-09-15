import React, { useState, useEffect, useRef } from 'react';
import './EditServerForm.css';

const EditServerForm = ({ server = {}, closeForm, saveServer }) => {
    console.log('EditServerForm server:', server);
    const [formData, setFormData] = useState({
        serverIp: server.serverIp || '',    
        serverDescription: server.serverDescription || '',
        clusterConnectedTo: server.clusterConnectedTo || '',
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
        if (!formData.serverIp || !formData.serverDescription) {
            alert('Please fill out all required fields.');
            return; // Exit the function without submitting the form
        }

        const serverData = {
            ...formData
        };

        try {
            const response = await fetch(`http://localhost:3000/management/servers/updateServerById/${server.serverId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serverData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Server updated successfully!');
                console.log('Server ID:', result.server.serverId);

                if (saveServer) {
                    saveServer(result.server);
                }

                closeForm();
            } else {
                console.error('Failed to update server:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while updating server:', error);
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
                    <h2>Edit Server</h2>

                    <div className="form-row">
                        <label htmlFor="serverIp">Server IP Address</label>
                        <input
                            type="text"
                            id="serverIp"
                            name="serverIp"
                            value={formData.serverIp}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="serverDescription">Server Description</label>
                        <input
                            type="text"
                            id="serverDescription"
                            name="serverDescription"
                            value={formData.serverDescription}
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

export default EditServerForm;

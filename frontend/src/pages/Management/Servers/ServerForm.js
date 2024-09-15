import React, { useState, useEffect, useRef } from 'react';
import './ServerForm.css';

const ServerForm = ({ closeForm, onServerAdded }) => {
    const [formData, setFormData] = useState({
        serverIp: '',
        serverDescription: '',
        clusterConnectedTo: '',
    });
    
    const formRef = useRef(null);

    // Handle form data changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Ensure required fields are not empty
        if (!formData.serverIp || !formData.serverDescription) {
            alert('Please fill out all required fields.');
            return; // Exit the function without submitting the form
        }
        
        console.log('Form data:', formData);
        const serverData = {
            ...formData,
            createdDate: "LOL1",
            createdTime: "LOL2"
        };

        try {
            const response = await fetch('http://localhost:3000/management/servers/addServer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serverData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Server added successfully:', result.server);
                console.log('Server ID:', result.server.serverId);
                
                if (onServerAdded) {
                    onServerAdded(result.server);
                }

                closeForm();
            } else {
                console.error('Failed to add server:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while adding server:', error);
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
                    <h2>Add New Server</h2>

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
                        <button type="submit" className="submit-btn">Add Test</button>
                        <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ServerForm;

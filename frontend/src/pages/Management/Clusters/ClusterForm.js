import React, { useState, useEffect, useRef } from 'react';
import './ClusterForm.css';

const ClusterForm = ({ closeForm, onClusterAdded }) => {
    const [formData, setFormData] = useState({
        clusterName: '',
        clusterDescription: '',
        clusterStatus: 'Available', // Default status
        poolConnectedTo: '', // Automatically set to empty
        createdDate: new Date().toISOString().split('T')[0], // Set default date to today
        createdTime: new Date().toLocaleTimeString('en-GB', { hour12: false }), // Set default time to now
        servers: [], // Add a field for selected servers
        testRunnerServer: '' // Add a field for the test runner server
    });

    const [servers, setServers] = useState([]); // State to hold fetched servers
    const formRef = useRef(null);

    // Fetch servers when the component mounts
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('http://localhost:3000/management/servers/allServers');
                if (response.ok) {
                    const serverData = await response.json();
                    // Filter servers where clusterConnectedTo is not null
                    const availableServers = serverData.filter(server => server.clusterConnectedTo === null);
                    setServers(availableServers);
                } else {
                    console.error('Failed to fetch servers:', response.statusText);
                }
            } catch (error) {
                console.error('Error occurred while fetching servers:', error);
            }
        };

        fetchServers();
    }, []);

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
        if (!formData.clusterName || !formData.clusterDescription) {
            alert('Please fill out all required fields.');
            return; // Exit the function without submitting the form
        }

        console.log('Form data:', formData);
        console.log('Type of name:', typeof formData.clusterName);
        console.log('servers:', formData.servers);
        console.log('server [0]:', formData.servers[0]);
        console.log('testRunnerServer:', formData.testRunnerServer);
        console.log('Type of servers:', typeof formData.servers);  
        console.log('Type of server [0]:', typeof formData.servers[0]);  
        console.log('Type of testRunnerServer:', typeof formData.testRunnerServer);

        try {
            const response = await fetch('http://localhost:3000/management/clusters/addCluster', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Cluster added successfully:', result.cluster);

                if (onClusterAdded) {
                    onClusterAdded(result.cluster);
                }

                closeForm();
            } else {
                console.error('Failed to add cluster:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while adding cluster:', error);
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

    const handleServerSelect = (e) => {
        const selectedServer = JSON.parse(e.target.value); // Parse the server object from string
        console.log('Selected server:', selectedServer);
    
        setFormData(prevData => {
            const serverExists = prevData.servers.some(server => server.serverIp === selectedServer.serverIp);
    
            const updatedServers = serverExists
                ? prevData.servers.filter(server => server.serverIp !== selectedServer.serverIp) // Remove server if already selected
                : [...prevData.servers, selectedServer]; // Add the full server object if not already selected
    
            return {
                ...prevData,
                servers: updatedServers,
                testRunnerServer: updatedServers.some(server => server.serverIp === prevData.testRunnerServer?.serverIp)
                    ? prevData.testRunnerServer
                    : '' // Clear testRunnerServer if it’s deselected
            };
        });
    };
    

    // // To track the changes in formData.servers and print the updated array:
    // useEffect(() => {
    //     console.log('Updated servers:', formData.servers);
    // }, [formData.servers]);

    // // Handle the selection of a server for the testRunnerServer
    // const handleTestRunnerSelect = (e) => {
    //     const selectedServer = JSON.parse(e.target.value); // Parse the server object from string
    //     console.log('Selected Test Runner Server:', selectedServer);
    
    //     setFormData(prevData => ({
    //         ...prevData,
    //         testRunnerServer: selectedServer // Store the full server object
    //     }));
    // };

    const handleTestRunnerSelect = (e) => {
        const selectedServerIp = e.target.value; // Get the selected serverIp
        console.log('Selected Test Runner Server IP:', selectedServerIp);
    
        // Find the full server object based on the selected serverIp
        const selectedServer = formData.servers.find(server => server.serverIp === selectedServerIp);
        console.log('Selected Test Runner Server:', selectedServer);
    
        setFormData(prevData => ({
            ...prevData,
            testRunnerServer: selectedServer || '' // Store the full server object or clear it if not found
        }));
    };

    return (
        <div className="form-overlay">
            <div className="form-card" ref={formRef}>
                <button className="close-btn" onClick={closeForm}>&times;</button>
                <form className="form-container" onSubmit={handleSubmit}>
                    <h2>Add New Cluster</h2>

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
                        <label>Select Servers</label>
                        <div className="server-list">
                            {servers.map((server) => (
                                <div key={server.serverIp} className="server-checkbox">
                                    <input
                                        type="checkbox"
                                        id={server.serverIp}
                                        value={JSON.stringify(server)} // Pass the entire server object as a string
                                        onChange={handleServerSelect}
                                        checked={formData.servers.some(selectedServer => selectedServer.serverIp === server.serverIp)}
                                    />
                                    <label htmlFor={server.serverIp}>{server.serverIp}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <div className="form-row">
                        <label htmlFor="testRunnerServer">Select Test Runner Server</label>
                        <select
                            id="testRunnerServer"
                            name="testRunnerServer"
                            value={formData.testRunnerServer?.serverIp || ''} // Display serverIp in the dropdown
                            onChange={handleTestRunnerSelect}
                            disabled={formData.servers.length === 0} // Disable if no servers are selected
                            required
                        >
                            <option value="">--Select Test Runner Server--</option>
                            {formData.servers.map(server => (
                                <option key={server.serverIp} value={JSON.stringify(server)}>
                                    {server.serverIp}
                                </option>
                            ))}
                        </select>
                    </div> */}

                    <div className="form-row">
                        <label htmlFor="testRunnerServer">Select Test Runner Server</label>
                        <select
                            id="testRunnerServer"
                            name="testRunnerServer"
                            value={formData.testRunnerServer?.serverIp || ''} // Display serverIp in the dropdown
                            onChange={handleTestRunnerSelect}
                            disabled={formData.servers.length === 0} // Disable if no servers are selected
                            required
                        >
                            <option value="">--Select Test Runner Server--</option>
                            {formData.servers.map(server => (
                                <option key={server.serverIp} value={server.serverIp}>
                                    {server.serverIp}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div className="btn-container">
                        <button type="submit" className="submit-btn">Add Cluster</button>
                        <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClusterForm;

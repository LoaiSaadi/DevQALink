import React, { useState, useEffect } from 'react';
import './Management.css'; // Add styling as needed
import EditServerForm from './Servers/EditServerForm'; // Import EditServerForm for editing servers
import ServerForm from './Servers/ServerForm'; // Import ServerForm for adding new servers
import DeleteServerForm from './Servers/DeleteServerForm'; // Import DeleteServerForm for deleting servers

const fetchServersData = async () => {
    try {
        const response = await fetch('http://localhost:3000/management/servers/allServers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching servers data:', error);
        throw error;
    }
};

const Management = () => {
    const [servers, setServers] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(true); // New state to differentiate form type
    const [editingServer, setEditingServer] = useState(null);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false); // State for delete form
    const [serverToDelete, setServerToDelete] = useState(null); // State to store the server to delete

    useEffect(() => {
        const fetchData = async () => {
            try {
                const serversData = await fetchServersData();
                setServers(serversData);
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        };

        fetchData();
    }, []);


    const openForm = () => {
        setIsAdding(true); // Set form type to add
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setIsAdding(true); // Reset to add mode
        setEditingServer(null);
        setIsDeleteFormOpen(false); // Close delete form
        setServerToDelete(null); // Reset server to delete
    };

    const openEditForm = (server) => {
        setEditingServer(server);
        setIsAdding(false); // Set form type to edit
        setIsFormOpen(true);
    };

    const openDeleteForm = (server) => {
        setServerToDelete(server);
        setIsDeleteFormOpen(true); // Open delete form
    };

    const handleServerDelete = async () => {
        console.log('Deleting server:', serverToDelete);
        try {
            const updatedServers = await fetchServersData();
            setServers(updatedServers);
        }
        catch (error) {
            console.error('Error handling deleted server:', error);
        }
    };

    const handleServerUpdated = async (updatedServer) => {
        try {
            const updatedServers = await fetchServersData();
            setServers(updatedServers);
        } catch (error) {
            console.error('Error handling updated server:', error);
        }
    };

    const handleServerAdded = async (newServer) => {
        console.log('Tring to show :', newServer);
        try {
            const updatedServers = await fetchServersData();
            setServers(updatedServers);
        } catch (error) {
            console.error('Error handling added server:', error);
        }
    };

    return (
        <div className="management-container">
            <h1>Resources Management</h1>
            <button onClick={openForm}>Add Server</button>
            {isFormOpen && (
                isAdding ? (
                    <ServerForm
                        closeForm={closeForm}
                        onServerAdded={handleServerAdded} // Handler for saving new servers
                    />
                ) : (
                    <EditServerForm
                        server={editingServer} // Passing the server object for editing
                        closeForm={closeForm}
                        saveServer={handleServerUpdated} // Handler for saving updates
                    />
                )
            )}
            {isDeleteFormOpen && (
                <DeleteServerForm
                    server={serverToDelete}
                    closeForm={closeForm}
                    deleteServer={handleServerDelete} // Handler for deleting servers
                />
            )}

            <h2>Servers</h2>
            <table className="servers-table">
                <thead>
                    <tr>
                        <th>Server ID</th>
                        <th>IP Address</th>
                        <th>Description</th>
                        <th>Cluster Connected To</th>
                        <th>Date Created</th>
                        <th>Time Created</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {servers.map(server => (
                        <tr key={server.serverId}>
                            <td>{server.serverId}</td>
                            <td>{server.serverIp}</td>
                            <td>{server.serverDescription}</td>
                            <td>{server.clusterConnectedTo}</td>
                            <td>{server.createdDate}</td>
                            <td>{server.createdTime}</td>
                            <td>
                                <button className='action-btn edit-btn' onClick={() => openEditForm(server)}>Edit</button>
                            </td>
                            <td>
                                <button className="action-btn delete-btn" onClick={() => openDeleteForm(server)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Management;

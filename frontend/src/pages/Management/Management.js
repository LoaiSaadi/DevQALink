import React, { useState, useEffect } from 'react';
import './Management.css'; // Add styling as needed
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is imported

import EditServerForm from './Servers/EditServerForm'; // Import EditServerForm for editing servers
import ServerForm from './Servers/ServerForm'; // Import ServerForm for adding new servers
import DeleteServerForm from './Servers/DeleteServerForm'; // Import DeleteServerForm for deleting servers

import EditClusterForm from './Clusters/EditClusterForm'; // Import EditClusterForm for editing clusters
import ClusterForm from './Clusters/ClusterForm'; // Import ClusterForm for adding new clusters
import DeleteClusterForm from './Clusters/DeleteClusterForm'; // Import DeleteClusterForm for deleting clusters

import EditPoolForm from './Pools/EditPoolForm';
import PoolForm from './Pools/PoolForm';
import DeletePoolForm from './Pools/DeletePoolForm';


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

const fetchClustersData = async () => {
    try {
        const response = await fetch('http://localhost:3000/management/clusters/allClusters');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching clusters data:', error);
        throw error;
    }
};

// Fetch pools data from the backend
const fetchPoolsData = async () => {
    try {
        const response = await fetch('http://localhost:3000/management/pools/allPools');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching pools data:', error);
        throw error;
    }
};

const Management = () => {
    // States for servers
    const [servers, setServers] = useState([]);
    const [isServerFormOpen, setIsServerFormOpen] = useState(false);
    const [isAddingServer, setIsAddingServer] = useState(true); // New state to differentiate form type
    const [editingServer, setEditingServer] = useState(null);
    const [isDeleteServerFormOpen, setIsDeleteServerFormOpen] = useState(false); // State for delete form
    const [serverToDelete, setServerToDelete] = useState(null); // State to store the server to delete

    // States for clusters
    const [clusters, setClusters] = useState([]);
    const [isClusterFormOpen, setIsClusterFormOpen] = useState(false);
    const [isAddingCluster, setIsAddingCluster] = useState(true); // New state to differentiate form type
    const [editingCluster, setEditingCluster] = useState(null);
    const [isDeleteClusterFormOpen, setIsDeleteClusterFormOpen] = useState(false); // State for delete form
    const [clusterToDelete, setClusterToDelete] = useState(null); // State to store the cluster to delete

    // States for pools
    const [pools, setPools] = useState([]);
    const [isPoolFormOpen, setIsPoolFormOpen] = useState(false);
    const [isAddingPool, setIsAddingPool] = useState(true);
    const [editingPool, setEditingPool] = useState(null);
    const [isDeletePoolFormOpen, setIsDeletePoolFormOpen] = useState(false);
    const [poolToDelete, setPoolToDelete] = useState(null); 

    const [timeLeft, setTimeLeft] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false); // Flag to track if session has expired

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // Decode the JWT token to get its expiration time
            const decoded = jwtDecode(token);
            console.log('Current time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })); // Display current time in Jerusalem time
            
            // Calculate the expiration time based on the decoded token
            const expirationTime = new Date(decoded.exp * 1000); // Convert seconds to milliseconds
            console.log('Token expiry time:', expirationTime.toString());

            const timeUntilExpiry = (decoded.exp * 1000 - Date.now()) / 1000; // Remaining time in seconds
            console.log('Time until expiry:', timeUntilExpiry);

            if (timeUntilExpiry > 0) {
                setTimeLeft(timeUntilExpiry); // Set the countdown timer

                // Reset the timer whenever user interacts (mousemove, keydown, click, scroll)
                const resetTimer = () => {
                    setTimeLeft(timeUntilExpiry); // Reset timer to full expiration time
                    setSessionExpired(false); // Reset session expired flag
                };

                // Add event listeners for activity
                window.addEventListener('mousemove', resetTimer);
                window.addEventListener('keydown', resetTimer);
                window.addEventListener('click', resetTimer);
                window.addEventListener('scroll', resetTimer);

                // Start the countdown
                const countdown = setInterval(() => {
                    setTimeLeft((prevTime) => {
                        console.log(`Time left: ${prevTime} seconds`); // Log time left
                        if (prevTime <= 1) {
                            clearInterval(countdown);
                            handleTokenExpiry(); // Call token expiry only if not already expired
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);

                // Clean up the listeners when component unmounts
                return () => {
                    clearInterval(countdown);
                    window.removeEventListener('mousemove', resetTimer);
                    window.removeEventListener('keydown', resetTimer);
                    window.removeEventListener('click', resetTimer);
                    window.removeEventListener('scroll', resetTimer);
                };
            } else {
                // Token already expired
                handleTokenExpiry();
            }
        } else {
            alert('No token found, redirecting to login.');
            window.location.href = '/login'; // Redirect to login
        }
    }, []); // Run this effect only once when the component mounts

    const handleTokenExpiry = () => {
        if (!sessionExpired) {
            setSessionExpired(true); // Set the flag to true to prevent multiple alerts
            alert('Session expired due to inactivity. Please log in again.'); // Alert for session expiry
            localStorage.removeItem('token'); // Remove token
            window.location.href = '/login'; // Redirect to login
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const serversData = await fetchServersData();
                setServers(serversData);
                const clustersData = await fetchClustersData();
                setClusters(clustersData);
                const poolsData = await fetchPoolsData();
                setPools(poolsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Server form handlers
    const openServerForm = () => {
        setIsAddingServer(true);
        setIsServerFormOpen(true);
    };

    const closeServerForm = () => {
        setIsServerFormOpen(false);
        setIsAddingServer(true);
        setEditingServer(null);
        setIsDeleteServerFormOpen(false);
        setServerToDelete(null);
    };

    const openEditServerForm = (server) => {
        setEditingServer(server);
        setIsAddingServer(false);
        setIsServerFormOpen(true);
    };

    const openDeleteServerForm = (server) => {
        setServerToDelete(server);
        setIsDeleteServerFormOpen(true);
    };

    const handleServerDelete = async () => {
        try {
            // Perform server deletion here (e.g., using a DELETE request)
            const updatedServers = await fetchServersData();
            const updatedClusters = await fetchClustersData();
            const updatedPools = await fetchPoolsData();
            setServers(updatedServers);
            setClusters(updatedClusters);
            setPools(updatedPools);
            closeServerForm();
        } catch (error) {
            console.error('Error handling deleted server:', error);
        }
    };

    const handleServerUpdated = async (updatedServer) => {
        try {
            // Perform server update here (e.g., using a PUT request)
            const updatedServers = await fetchServersData();
            const updatedClusters = await fetchClustersData();
            setServers(updatedServers);
            setClusters(updatedClusters);
        } catch (error) {
            console.error('Error handling updated server:', error);
        }
    };

    const handleServerAdded = async (newServer) => {
        try {
            // Perform server addition here (e.g., using a POST request)
            const updatedServers = await fetchServersData();
            setServers(updatedServers);
        } catch (error) {
            console.error('Error handling added server:', error);
        }
    };

    // Cluster form handlers
    const openClusterForm = () => {
        setIsAddingCluster(true);
        setIsClusterFormOpen(true);
    };

    const closeClusterForm = () => {
        setIsClusterFormOpen(false);
        setIsAddingCluster(true);
        setEditingCluster(null);
        setIsDeleteClusterFormOpen(false);
        setClusterToDelete(null);
    };

    const openEditClusterForm = (cluster) => {
        setEditingCluster(cluster);
        setIsAddingCluster(false);
        setIsClusterFormOpen(true);
    };

    const openDeleteClusterForm = (cluster) => {
        setClusterToDelete(cluster);
        setIsDeleteClusterFormOpen(true);
    };

    // Pool form handlers
    const openPoolForm = () => {
        setIsAddingPool(true);
        setIsPoolFormOpen(true);
    };

    const closePoolForm = () => {
        setIsPoolFormOpen(false);
        setIsAddingPool(true);
        setEditingPool(null);
        setIsDeletePoolFormOpen(false);
        setPoolToDelete(null);
    };

    const openEditPoolForm = (pool) => {
        setEditingPool(pool);
        setIsAddingPool(false);
        setIsPoolFormOpen(true);
    };

    const openDeletePoolForm = (pool) => {
        setPoolToDelete(pool);
        setIsDeletePoolFormOpen(true);
    };

    const handlePoolAdded = async (newPool) => {
        try {
            // Update the 'poolConnectedTo' field for each cluster
            const updateClusterPromises = newPool.clusters.map(async (cluster) => {
                console.log('Updating cluster:', cluster);
                const response = await fetch(`http://localhost:3000/management/clusters/updateThePoolConnectedToById/${cluster}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ poolConnectedTo: newPool }), // Now updating poolConnectedTo field
                });
        
                if (!response.ok) {
                    throw new Error(`Failed to update cluster ${cluster}: ${response.statusText}`);
                }
            });
        
            // Wait for all cluster updates to complete
            await Promise.all(updateClusterPromises);
        
            // Perform any additional actions like fetching updated data
            const updatedServers = await fetchServersData();
            const updatedClusters = await fetchClustersData();
            const updatedPools = await fetchPoolsData();
            setServers(updatedServers);
            setClusters(updatedClusters);
            setPools(updatedPools);
        } catch (error) {
            console.error('Error handling added pool:', error);
        }
        


        const updatedPools = await fetchPoolsData();
        const updatedClusters = await fetchClustersData();
        setPools(updatedPools);
        setClusters(updatedClusters);
    };

    const handlePoolUpdated = async () => {
        const updatedPools = await fetchPoolsData();
        const updatedClusters = await fetchClustersData();
        setPools(updatedPools);
        setClusters(updatedClusters);
    };

    const handlePoolDelete = async (deletedPool) => {
        // Update the 'poolConnectedTo' field for each cluster
        const updateClusterPromises = deletedPool.clusters.map(async (clusterId) => {
            const response = await fetch(`http://localhost:3000/management/clusters/updateThePoolConnectedToById/${clusterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ poolConnectedTo: null }), // Set 'poolConnectedTo' to null
            });

            if (!response.ok) {
                throw new Error(`Failed to update cluster ${clusterId}: ${response.statusText}`);
            }
        });

        // Wait for all cluster updates to complete
        await Promise.all(updateClusterPromises);

        const updatedPools = await fetchPoolsData();
        const updatedClusters = await fetchClustersData();
        setPools(updatedPools);
        setClusters(updatedClusters);
        closePoolForm();
    };

    const handleClusterDelete = async (deletedCluster) => {
        try {
            // Update the 'clusterConnectedTo' field for each server
            const updateServerPromises = deletedCluster.servers.map(async (serverIp) => {
                const response = await fetch(`http://localhost:3000/management/servers/updateTheClusterConnectedToByIp/${serverIp}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clusterConnectedTo: null }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update server ${serverIp}: ${response.statusText}`);
                }
            });

            // Wait for all server updates to complete
            await Promise.all(updateServerPromises);

            try {
                const response = await fetch(`http://localhost:3000/management/servers/updateIsTestRunnerServerByIp/${deletedCluster.testRunnerServer}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to update test runner server: ${response.statusText}`);
                }
            }
            catch (error) {
                console.error('Error updating test runner server:', error);
            }

            // Perform cluster deletion here (e.g., using a DELETE request)
            const updatedServers = await fetchServersData();
            const updatedClusters = await fetchClustersData();
            const updatedPools = await fetchPoolsData();
            setServers(updatedServers);
            setClusters(updatedClusters);
            setPools(updatedPools);
            closeClusterForm();
        } catch (error) {
            console.error('Error handling deleted cluster:', error);
        }
    };

    const handleClusterUpdated = async (updatedCluster) => {
        try {
            // Perform cluster update here (e.g., using a PUT request)
            const updatedClusters = await fetchClustersData();
            const updatedServers = await fetchServersData();
            const updatedPools = await fetchPoolsData();
            setClusters(updatedClusters);
            setServers(updatedServers);
            setPools(updatedPools);
        } catch (error) {
            console.error('Error handling updated cluster:', error);
        }
    };

    const handleClusterAdded = async (newCluster) => {
        try {
            // Update the 'clusterConnectedTo' field for each server
            const updateServerPromises = newCluster.servers.map(async (server) => {
                console.log('Updating server:', server);
                const response = await fetch(`http://localhost:3000/management/servers/updateTheClusterConnectedToByIp/${server}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clusterConnectedTo: newCluster }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update server ${server}: ${response.statusText}`);
                }
            });

            // Wait for all server updates to complete
            await Promise.all(updateServerPromises);

            try {
                const response = await fetch(`http://localhost:3000/management/servers/updateIsTestRunnerServerByIp/${newCluster.testRunnerServer}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to update test runner server: ${response.statusText}`);
                }
            }
            catch (error) {
                console.error('Error updating test runner server:', error);
            }

            // Perform cluster addition here (e.g., using a POST request)
            const updatedServers = await fetchServersData();
            const updatedClusters = await fetchClustersData();
            const updatedPools = await fetchPoolsData();
            setServers(updatedServers);
            setClusters(updatedClusters);
            setPools(updatedPools);
        } catch (error) {
            console.error('Error handling added cluster:', error);
        }
    };

    return (
        <div className="management-container">
            <h1>Resources Management</h1>

            <p style={{ fontSize: '1.2em' }}>
            This section enables efficient management of resource pools, clusters, and servers,
            allowing you to add, edit, or delete resources as needed.
            </p>

            <hr className="separator" />
    
            {/* Pools Section */}
            <h2>Pools</h2>
            <p style={{ fontSize: '1.2em' }}>This section allows you to manage resource pools, including adding, editing, and deleting pools.</p>
            <button onClick={openPoolForm}>Add Pool</button>
            {isPoolFormOpen && (
                isAddingPool ? (
                    <PoolForm closeForm={closePoolForm} onPoolAdded={handlePoolAdded} />
                ) : (
                    <EditPoolForm pool={editingPool} closeForm={closePoolForm} savePool={handlePoolUpdated} />
                )
            )}
            {isDeletePoolFormOpen && (
                <DeletePoolForm pool={poolToDelete} closeForm={closePoolForm} deletePool={handlePoolDelete} />
            )}
            <table className="pools-table">
                <thead>
                    <tr>
                        <th>Pool ID</th>
                        <th>Pool Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Clusters</th>
                        <th>Clusters Number</th>
                        <th>Servers Number</th>
                        <th>Date Created</th>
                        <th>Time Created</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {pools.map(pool => (
                        <tr key={pool.poolId}>
                            <td>{pool.poolId}</td>
                            <td>{pool.poolName}</td>
                            <td>{pool.poolDescription}</td>
                            <td>{pool.poolStatus}</td>
                            <td>
                                <div className="clusters-list">
                                    {pool.clusters && pool.clusters.length > 0 ? (
                                        <ul>
                                            {pool.clusters.map((clusterId, index) => {
                                                const matchingCluster = clusters.find(cluster => cluster._id === clusterId);
                                                return (
                                                    <li key={index}>
                                                        {matchingCluster ? matchingCluster.clusterName : '-'}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="no-clusters">-</div>
                                    )}
                                </div>
                            </td>
                            <td>{pool.clustersNumber}</td>
                            <td>{pool.serversNumber}</td>
                            <td>{pool.createdDate}</td>
                            <td>{pool.createdTime}</td>
                            <td>
                                <button className="action-btn edit-btn" onClick={() => openEditPoolForm(pool)}>Edit</button>
                            </td>
                            <td>
                                <button className="action-btn delete-btn" onClick={() => openDeletePoolForm(pool)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr style={{ margin: '20px 0' }} />
    
            {/* Clusters Section */}
            <h2>Clusters</h2>
            <p style={{ fontSize: '1.2em' }}>This section allows you to manage clusters associated with resource pools.</p>
            <button onClick={openClusterForm}>Add Cluster</button>
            {isClusterFormOpen && (
                isAddingCluster ? (
                    <ClusterForm
                        closeForm={closeClusterForm}
                        onClusterAdded={handleClusterAdded} // Handler for saving new clusters
                    />
                ) : (
                    <EditClusterForm
                        cluster={editingCluster} // Passing the cluster object for editing
                        closeForm={closeClusterForm}
                        saveCluster={handleClusterUpdated} // Handler for saving updates
                    />
                )
            )}
            {isDeleteClusterFormOpen && (
                <DeleteClusterForm
                    cluster={clusterToDelete}
                    closeForm={closeClusterForm}
                    deleteCluster={handleClusterDelete} // Handler for deleting clusters
                />
            )}
            <table className="clusters-table">
                <thead>
                    <tr>
                        <th>Cluster ID</th>
                        <th>Cluster Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Servers</th>
                        <th>Pool Connected To</th>
                        <th>Test Runner</th>
                        <th>Servers Number</th>
                        <th>Date Created</th>
                        <th>Time Created</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {clusters.map(cluster => (
                        <tr key={cluster.clusterId}>
                            <td>{cluster.clusterId}</td>
                            <td>{cluster.clusterName}</td>
                            <td>{cluster.clusterDescription}</td>
                            <td>{cluster.clusterStatus}</td>
                            <td>
                                <ul>
                                    {cluster.servers.map((serverId, index) => {
                                        const matchingServer = servers.find(server => server._id === serverId);
                                        return (
                                            <li key={index}>
                                                {matchingServer ? matchingServer.serverIp : '-'}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </td>
                            <td>
                                {(() => {
                                    const pool = pools.find(pool => pool._id === cluster.poolConnectedTo);
                                    return pool ? pool.poolName : '-';
                                })()}
                            </td>
                            <td>
                                {(() => {
                                    const testRunner = servers.find(server => server._id === cluster.testRunnerServer);
                                    return testRunner ? testRunner.serverIp : '-';
                                })()}
                            </td>
                            <td>{cluster.serversNumber}</td>
                            <td>{cluster.createdDate}</td>
                            <td>{cluster.createdTime}</td>
                            <td>
                                <button className='action-btn edit-btn' onClick={() => openEditClusterForm(cluster)}>Edit</button>
                            </td>
                            <td>
                                <button className="action-btn delete-btn" onClick={() => openDeleteClusterForm(cluster)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
    
            {/* Separator for Clusters */}
            <hr style={{ margin: '20px 0' }} />
    
            {/* Servers Section */}
            <h2>Servers</h2>
            <p style={{ fontSize: '1.2em' }}>This section allows you to manage servers within your clusters.</p>
            <button onClick={openServerForm}>Add Server</button>
            {isServerFormOpen && (
                isAddingServer ? (
                    <ServerForm
                        closeForm={closeServerForm}
                        onServerAdded={handleServerAdded} // Handler for saving new servers
                    />
                ) : (
                    <EditServerForm
                        server={editingServer} // Passing the server object for editing
                        closeForm={closeServerForm}
                        saveServer={handleServerUpdated} // Handler for saving updates
                    />
                )
            )}
            {isDeleteServerFormOpen && (
                <DeleteServerForm
                    server={serverToDelete}
                    closeForm={closeServerForm}
                    deleteServer={handleServerDelete} // Handler for deleting servers
                />
            )}
            <table className="servers-table">
                <thead>
                    <tr>
                        <th>Server ID</th>
                        <th>IP Address</th>
                        <th>Description</th>
                        <th>Is Test Runner</th>
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
                            <td>{server.isTestRunner ? 'Yes' : 'No'}</td>
                            <td>
                                {(() => {
                                    const cluster = clusters.find(cluster => cluster._id === server.clusterConnectedTo);
                                    return cluster ? cluster.clusterName : '-';
                                })()}
                            </td>
                            <td>{server.createdDate}</td>
                            <td>{server.createdTime}</td>
                            <td>
                                <button className='action-btn edit-btn' onClick={() => openEditServerForm(server)}>Edit</button>
                            </td>
                            <td>
                                <button className="action-btn delete-btn" onClick={() => openDeleteServerForm(server)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <footer className="footer">
                <p>© {new Date().getFullYear()} QA and Dev Scheduling Framework. All rights reserved.</p>
            </footer>
        </div>
    );
    
};

export default Management;

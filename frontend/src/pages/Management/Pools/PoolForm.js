import React, { useState, useEffect, useRef } from 'react';
import './PoolForm.css';

const PoolForm = ({ closeForm, onPoolAdded }) => {
    const [formData, setFormData] = useState({
        poolName: '',
        poolDescription: '',
        clusters: [], // Clusters selected by the user
        poolStatus: 'Available', // Automatically set to 'Available'
        createdDate: new Date().toISOString().split('T')[0], // Auto-set to today
        createdTime: new Date().toLocaleTimeString('en-GB', { hour12: false }) // Auto-set to current time
    });

    const [clusters, setClusters] = useState([]); // Fetched clusters
    const formRef = useRef(null);

    // Fetch clusters when the component mounts
    useEffect(() => {
        const fetchClusters = async () => {
            try {
                const response = await fetch('http://localhost:3000/management/clusters/allClusters');
                if (response.ok) {
                    const clusterData = await response.json();
                    // Filter servers where poolConnectedTo is not null
                    const availableClusters = clusterData.filter(cluster => cluster.poolConnectedTo === null);
                    setClusters(availableClusters); // Set clusters with fetched data
                } else {
                    console.error('Failed to fetch clusters:', response.statusText);
                }
            } catch (error) {
                console.error('Error occurred while fetching clusters:', error);
            }
        };

        fetchClusters();
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
        if (!formData.poolName || !formData.poolDescription || formData.clusters.length === 0) {
            alert('Please fill out all required fields.');
            return;
        }

        // Compute clustersNumber and serversNumber based on selected clusters
        const clustersNumber = formData.clusters.length;
        const serversNumber = formData.clusters.reduce((totalServers, cluster) => totalServers + cluster.serversNumber, 0);

        const poolData = {
            ...formData,
            clustersNumber,  // Set number of clusters
            serversNumber,   // Set number of servers based on selected clusters
        };

        console.log('Final pool data:', poolData);

        try {
            const response = await fetch('http://localhost:3000/management/pools/addPool', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(poolData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Pool added successfully:', result.pool);

                if (onPoolAdded) {
                    onPoolAdded(result.pool);
                }

                closeForm();
            } else {
                console.error('Failed to add pool:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while adding pool:', error);
        }
    };

    // Handle cluster selection
    const handleClusterSelect = (e) => {
        const selectedCluster = JSON.parse(e.target.value); // Parse the cluster object from string

        setFormData(prevData => {
            const clusterExists = prevData.clusters.some(cluster => cluster.clusterId === selectedCluster.clusterId);

            const updatedClusters = clusterExists
                ? prevData.clusters.filter(cluster => cluster.clusterId !== selectedCluster.clusterId) // Remove cluster if already selected
                : [...prevData.clusters, selectedCluster]; // Add the cluster object if not already selected

            return {
                ...prevData,
                clusters: updatedClusters
            };
        });
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
                    <h2>Add New Pool</h2>

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
                        <label>Select Clusters</label>
                        <div className="cluster-list">
                            {clusters.map((cluster) => (
                                <div key={cluster.clusterId} className="cluster-checkbox">
                                    <input
                                        type="checkbox"
                                        id={cluster.clusterId}
                                        value={JSON.stringify(cluster)} // Pass the entire cluster object as a string
                                        onChange={handleClusterSelect}
                                        checked={formData.clusters.some(selectedCluster => selectedCluster.clusterId === cluster.clusterId)}
                                    />
                                    <label htmlFor={cluster.clusterId}>{cluster.clusterName}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="btn-container">
                        <button type="submit" className="submit-btn">Add Pool</button>
                        <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PoolForm;


import React, { useState, useEffect, useRef } from 'react';
//import './JobForm.css';
import './EditJobForm.css';

const EditJobForm = ({ job, closeForm, saveJob }) => {
    const [poolNames, setPoolNames] = useState([]);

    // Fetch pool names from the database
    const fetchPoolNames = async () => {
        try {
            const response = await fetch('http://localhost:3000/pools/getAllPools'); // Update with your API endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPoolNames(data.map(pool => pool.name)); // Assume the response structure
        } catch (error) {
            console.error('Error fetching pool names:', error);
        }
    };

    useEffect(() => {
        fetchPoolNames();
    }, []);

    // Format time helper function
    const formatTime = (time) => {
        if (!time) return '';  // Handle empty or undefined time

        const timeParts = time.split(' ');
        const is12HourFormat = timeParts.length === 2;
        
        let [hours, minutes] = timeParts[0].split(':');

        if (typeof minutes === 'undefined') {
            minutes = '00';
        }

        if (is12HourFormat) {
            const modifier = timeParts[1];
            if (hours === '12') {
                hours = '00';
            }
            if (modifier === 'PM') {
                hours = parseInt(hours, 10) + 12;
            }
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const [formData, setFormData] = useState({
        jobName: job.jobName || '',
        testsToRun: Array.isArray(job.testsToRun) ? job.testsToRun.join(', ') : job.testsToRun || '',
        resourcePool: job.resourcePool || '',
        buildVersion: job.buildVersion || '',
        jobRunType: job.jobRunType || 'Immediately',
        scheduleType: job.scheduleType || '',
        scheduleTime: formatTime(job.scheduleTime),
        priorityLevel: job.priorityLevel || '1',
        estimatedHours: job.estimatedTime ? parseInt(job.estimatedTime.split('h')[0].trim()) : '0',
        estimatedMinutes: job.estimatedTime ? parseInt(job.estimatedTime.split('h')[1].split('m')[0].trim()) : '0',
        // estimatedHours: job.estimatedHours,
        // estimatedMinutes: job.estimatedMinutes,
        activationStatus: job.activationStatus || 'Activated'
    });

    const [isActivationStatusDisabled, setIsActivationStatusDisabled] = useState(formData.scheduleType !== 'Reoccurring Job');
    const formRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'scheduleType') {
            setIsActivationStatusDisabled(value !== 'Reoccurring Job');
        }
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Function to update the job using the API
    const updateJob = async (updatedJobData) => {

        // Validation: Ensure estimated hours and minutes are not both zero
        if (updatedJobData.estimatedHours === '0' && updatedJobData.estimatedMinutes === 0) {
            alert('Please select a valid estimated time. Estimated hours and minutes cannot both be zero.');
            return; // Exit 
        }
        else {
            console.log('Estimated hours and minutes are valid');
        }
        
        const estimatedTime = `${updatedJobData.estimatedHours}h ${updatedJobData.estimatedMinutes}m`;
        console.log('Hours:', updatedJobData.estimatedHours);
        console.log('Minutes:', updatedJobData.estimatedMinutes);
        console.log('Type of hours:', typeof updatedJobData.estimatedHours);
        console.log('Type of minutes:', typeof updatedJobData.estimatedMinutes);

        const validScheduleTypes = ['One-Time Job', 'Reoccurring Job'];
        const validScheduleType = validScheduleTypes.includes(formData.scheduleType) ? formData.scheduleType : '-';
        const newScheduleTime = getCurrentTime();

        // Prepare the data to send in the request body
        const jobData = {
            jobName: updatedJobData.jobName,
            testsToRun: updatedJobData.testsToRun.split(',').map(test => test.trim()),
            resourcePool: updatedJobData.resourcePool,
            buildVersion: updatedJobData.buildVersion,
            jobRunType: updatedJobData.jobRunType,
            // scheduleType: updatedJobData.scheduleType,
            scheduleType: formData.jobRunType === 'Immediately' ? '-' : validScheduleType, // Updated line
            scheduleTime: formData.jobRunType === 'Immediately' ? newScheduleTime : updatedJobData.scheduleTime,
            priorityLevel: updatedJobData.priorityLevel,
            estimatedTime: estimatedTime,
            activationStatus: updatedJobData.activationStatus,
        };

        try {
            let response = null;
            if (job.status === 'Waiting') {
                    response = await fetch(`http://localhost:3000/jobs/waitingJobs/updateJobById/${job.jobId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jobData),
                });
            }
            if (job.status === 'Ready') {
                    response = await fetch(`http://localhost:3000/jobs/readyJobs/updateJobById/${job.jobId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jobData),
                });
            }

            const result = await response.json();
            if (response.ok) {
                // Successfully updated
                saveJob(result.job); // Update the parent component with the new job data
                closeForm();
            } else {
                // Handle errors
                console.error('Failed to update job:', result.message);
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating job:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateJob(formData); // Call the function to update the job
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

    const generateOptions = (start, end) => {
        const options = [];
        for (let i = start; i <= end; i++) {
            options.push(
                <option key={i} value={i}>
                    {i}
                </option>
            );
        }
        return options;
    };
    
    console.log('Job:', job.status);
    const isReady = job.status === 'Ready';

    return (
        <div className="form-overlay">
            <div className="form-card" ref={formRef}>
                <button className="close-btn" onClick={closeForm}>&times;</button>
                <form className="form-container" onSubmit={handleSubmit}>
                    <h2>Edit Job</h2>

                    <div className="form-row">
                        <label htmlFor="jobName">Job Name</label>
                        <input 
                            type="text" 
                            id="jobName" 
                            name="jobName" 
                            value={formData.jobName} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="testsToRun">Tests to Run</label>
                        <input 
                            type="text" 
                            id="testsToRun" 
                            name="testsToRun" 
                            value={formData.testsToRun} 
                            onChange={handleChange}
                            disabled={isReady}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="resourcePool">Resource Pool</label>
                        <select 
                            id="resourcePool" 
                            name="resourcePool" 
                            value={formData.resourcePool} 
                            onChange={handleChange} 
                            disabled={isReady}
                        >
                            <option value="" disabled>Select a pool</option>
                            {poolNames.map(pool => (
                                <option key={pool} value={pool}>{pool}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="buildVersion">Build Version</label>
                        <input 
                            type="text" 
                            id="buildVersion" 
                            name="buildVersion" 
                            value={formData.buildVersion} 
                            onChange={handleChange} 
                            disabled={isReady} 
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="jobRunType">Job Run Type</label>
                        <select 
                            id="jobRunType" 
                            name="jobRunType" 
                            value={formData.jobRunType} 
                            onChange={handleChange} 
                            disabled={isReady}
                        >
                            <option value="Immediately">Immediately</option>
                            <option value="Scheduled">Scheduled</option>
                        </select>
                    </div>

                    {formData.jobRunType === 'Scheduled' && (
                        <>
                            <div className="form-row">
                                <label htmlFor="scheduleType">Schedule Type</label>
                                <select
                                    id="scheduleType"
                                    name="scheduleType"
                                    value={formData.scheduleType}
                                    onChange={handleChange}
                                    disabled={isReady}
                                >
                                    <option value="One-Time Job">One-Time Job</option>
                                    <option value="Reoccurring Job">Reoccurring Job</option>
                                </select>
                            </div>

                            {formData.scheduleType === 'Reoccurring Job' && (
                                <div className="form-row">
                                    <label htmlFor="activationStatus">Activation Status</label>
                                    <select
                                        id="activationStatus"
                                        name="activationStatus"
                                        value={formData.activationStatus}
                                        onChange={handleChange}
                                        disabled={isReady}
                    
                                    >
                                        <option value="Activated">Activated</option>
                                        <option value="Deactivated">Deactivated</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-row">
                                <label htmlFor="scheduleTime">Schedule Time</label>
                                <input
                                    type="time"
                                    id="scheduleTime"
                                    name="scheduleTime"
                                    value={formData.scheduleTime}
                                    onChange={handleChange}
                                    disabled={isReady}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-row">
                        <label htmlFor="priorityLevel">Priority Level</label>
                        <select 
                            id="priorityLevel" 
                            name="priorityLevel" 
                            value={formData.priorityLevel} 
                            onChange={handleChange} 
                            required
                        >
                            {generateOptions(1, 10)}
                        </select>
                    </div>

                    <div className="form-row">
                        <label>Estimated Tests Time</label>
                        <div className="time-select">
                            <select
                                name="estimatedHours"
                                value={formData.estimatedHours}
                                onChange={handleChange}
                                disabled={isReady}
                            >
                                {generateOptions(0, 48)}
                            </select>
                            <span>Hours</span>
                            <select
                                name="estimatedMinutes"
                                value={formData.estimatedMinutes}
                                onChange={handleChange}
                                disabled={isReady}
                            >
                                {generateOptions(0, 59)}
                            </select>
                            <span>Minutes</span>
                        </div>
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

export default EditJobForm;

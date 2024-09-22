
import React, { useState, useEffect, useRef } from 'react';
import './EditJobForm.css';

const EditJobForm = ({ job, closeForm, saveJob }) => {
    const [poolNames, setPoolNames] = useState([]);
    const [testNames, setTestNames] = useState([]); // State to store test names
    const [versionBuilds, setVersionBuilds] = useState([]); // State to store version builds

    // Fetch pool names from the database
    const fetchPoolNames = async () => {
        try {
            const response = await fetch('http://localhost:3000/management/pools/allPools'); // Update with your API endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPoolNames(data.map(pool => pool.poolName)); // Assume the response structure
        } catch (error) {
            console.error('Error fetching pool names:', error);
        }
    };

    // Fetch test names from the database
    const fetchTestNames = async () => {
        try {
            const response = await fetch('http://localhost:3000/tests/allTests'); // Update with your API endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTestNames(data.map(test => test.testTitle)); // Assume the response structure
        } catch (error) {
            console.error('Error fetching test names:', error);
        }
    };

    // Fetch version builds from the database
    const fetchVersionBuilds = async () => {
        try {
            const response = await fetch('http://localhost:3000/builds/allVersionBuilds'); // Update with your API endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setVersionBuilds(data.map(build => build.buildVersion)); // Assume the response structure
        } catch (error) {
            console.error('Error fetching version builds:', error);
        }
    };


    useEffect(() => {
        fetchTestNames();
        fetchPoolNames();
        fetchVersionBuilds();
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

    const time_parts = job.estimatedTime.split(":");

    const Hours = time_parts[0];
    const Min = time_parts[1];
    const Sec = time_parts[2];

    const [formData, setFormData] = useState({
        jobName: job.jobName || '',
        testToRun: job.testToRun || '',
        resourcePool: job.resourcePool || '',
        buildVersion: job.buildVersion || '',
        jobRunType: job.jobRunType || 'Immediately',
        scheduleType: job.scheduleType || '',
        scheduleTime: formatTime(job.scheduleTime),
        priorityLevel: job.priorityLevel || '1',
        estimatedHours: Hours,
        estimatedMinutes: Min,
        estimatedSeconds: Sec,
        activationStatus: job.activationStatus || 'Activated'
    });

    // const [isActivationStatusDisabled, setIsActivationStatusDisabled] = useState(formData.scheduleType !== 'Reoccurring Job');
    const formRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // if (name === 'scheduleType') {
        //     setIsActivationStatusDisabled(value !== 'Reoccurring Job');
        // }
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Function to update the job using the API
    const updateJob = async (updatedJobData) => {

         // Pad hours and minutes with leading zeros to ensure they are always two digits
         const paddedHours = updatedJobData.estimatedHours.padStart(2, '0');
         const paddedMinutes = updatedJobData.estimatedMinutes.padStart(2, '0');
         const paddedSeconds = updatedJobData.estimatedSeconds.padStart(2, '0');
 
        // Validation: Ensure estimated hours and minutes are not both zero
        if (paddedHours === '00' && paddedMinutes === '00' && paddedSeconds === '00') {
            alert('Please select a valid estimated time. Estimated hours and minutes cannot both be zero.');
            return; // Exit 
        }
        else {
            console.log('Estimated hours and minutes are valid');
        }
       
        // Format the estimated time as HH:mm
        const newEstimatedTime = `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        console.log('New Estimated Time:', newEstimatedTime);
        

        const validScheduleTypes = ['One-Time Job', 'Reoccurring Job'];
        const validScheduleType = validScheduleTypes.includes(formData.scheduleType) ? formData.scheduleType : '-';
        const newScheduleTime = getCurrentTime();

        // Prepare the data to send in the request body
        const jobData = {
            jobName: updatedJobData.jobName,
            testToRun: updatedJobData.testToRun,
            resourcePool: updatedJobData.resourcePool,
            buildVersion: updatedJobData.buildVersion,
            jobRunType: updatedJobData.jobRunType,
            scheduleType: formData.jobRunType === 'Immediately' ? '-' : validScheduleType, // Updated line
            scheduleTime: formData.jobRunType === 'Immediately' ? newScheduleTime : updatedJobData.scheduleTime,
            priorityLevel: updatedJobData.priorityLevel,
            estimatedTime: newEstimatedTime,
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
{/* 
                    <div className="form-row">
                        <label htmlFor="testToRun">Tests to Run</label>
                        <input 
                            type="text" 
                            id="testToRun" 
                            name="testToRun" 
                            value={formData.testToRun} 
                            onChange={handleChange}
                            disabled={isReady}
                        />
                    </div> */}

                    <div className="form-row">
                        <label htmlFor="testToRun">Tests to Run</label>
                        <select id="testToRun" name="testToRun" value={formData.testToRun} onChange={handleChange} required>
                            <option value="" disabled>Select a test</option>
                            {testNames.map(test => (
                                <option key={test} value={test}>{test}</option>
                            ))}
                        </select>
                    </div>

                    {/* <div className="form-row">
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
                    </div> */}

                    <div className="form-row">
                        <label htmlFor="resourcePool">Resource Pool</label>
                        <select id="resourcePool" name="resourcePool" value={formData.resourcePool} onChange={handleChange} required>
                            <option value="" disabled>Select a pool</option>
                            {poolNames.map(pool => (
                                <option key={pool} value={pool}>{pool}</option>
                            ))}
                        </select>
                    </div>
{/* 
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
                    </div> */}

                    <div className="form-row">
                        <label htmlFor="buildVersion">Build Version</label>
                        <select id="buildVersion" name="buildVersion" value={formData.buildVersion} onChange={handleChange} required>
                            <option value="" disabled>Select a build version</option>
                            {versionBuilds.map(buildVersion => (
                                <option key={buildVersion} value={buildVersion}>{buildVersion}</option>
                            ))}
                        </select>
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
                            <select
                                name="estimatedSeconds"
                                value={formData.estimatedSeconds}
                                onChange={handleChange}
                                disabled={isReady}
                                required
                            >
                                {generateOptions(0, 59)}
                            </select>
                            <span>Seconds</span>
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


import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Jobs.css';
import JobForm from './JobForm';
import EditJobForm from './EditJobForm';
import DeleteJobForm from './DeleteJobForm';
import pauseIcon from './pause.png'; // Adjust the relative path as needed
import resumeIcon from './play-buttton.png';


const fetchWaitingJobsData = async () => {
    try {
        const response = await fetch('http://localhost:3000/jobs/waitingJobs/allWaitingJobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching waiting jobs data:', error);
        throw error;
    }
};

const fetchReadyJobsData = async () => {
    try {
        const response = await fetch('http://localhost:3000/jobs/readyJobs/allReadyJobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching ready jobs data:', error);
        throw error;
    }
};

const fetchRunningJobsData = async () => {
    try {
        const response = await fetch('http://localhost:3000/jobs/runningJobs/allRunningJobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching running jobs data:', error);
        throw error;
    }
};

const Jobs = () => {
    const [waitingJobs, setWaitingJobs] = useState([]);
    const [readyJobs, setReadyJobs] = useState([]);
    const [runningJobs, setRunningJobs] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [deletingJob, setDeletingJob] = useState(null);

    // const example = useRef(new Array());
    const example = useRef([]);  // This holds the jobs ready to be processed
    const [trigger, setTrigger] = useState(0); // A state to trigger re-renders




    // Fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const waitingJobsData = await fetchWaitingJobsData();
                const readyJobsData = await fetchReadyJobsData();
                const runningJobsData = await fetchRunningJobsData();
                setWaitingJobs(waitingJobsData);
                setReadyJobs(readyJobsData);
                setRunningJobs(runningJobsData);
            } catch (error) {
                console.error('Error fetching job data:', error);
            }
        };

        fetchData();
    }, []);

    // Memoize moveJobToReady using useCallback
    const moveJobToReady = useCallback(async (jobId) => {
        try {
            const jobData = await fetch(`http://localhost:3000/jobs/waitingJobs/getJobById/${jobId}`); 
            const job = await jobData.json();
            console.log("Moving this job from waiting to ready: ", job);

            if (job.resumeJob === "Resume") {
            // API to insert the job into ReadyJobs
            await fetch(`http://localhost:3000/jobs/readyJobs/addJob`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(job), // assuming jobId is enough to insert it
            });
            console.log(`Job ${jobId} moved from WaitingJobs to ReadyJobs`);
            
            // API to delete the job from WaitingJobs
            await fetch(`http://localhost:3000/jobs/waitingJobs/deleteJobById/${jobId}`, { 
                method: 'DELETE',
            });
            console.log(`Job ${jobId} deleted from WaitingJobs`);
            
            example.current.push(job);
            setTrigger(prev => prev + 1); // Trigger re-render to process the new job

            handleJobDeleted(); // Update the waiting jobs and ready jobs lists
        }
        
        } catch (error) {
            console.error(`Error moving job ${jobId} to ReadyJobs:`, error);
        }
    }, []); // No dependencies, so it will be memoized once and remain stable

    // Polling mechanism to check scheduleTime every minute
    useEffect(() => {
        const checkJobsSchedule = () => {
            const currentTime = new Date();
            const jerusalemTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Jerusalem',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Ensure 24-hour format
            }).format(currentTime);

            console.log('Checking jobs schedule at Jerusalem time:', jerusalemTime);

            // Iterate over waitingJobs and check if any job's scheduleTime matches the current time
            waitingJobs.forEach((job) => {
                if (job.jobRunType === "Scheduled" && job.activationStatus === "Activated" && job.scheduleTime === jerusalemTime) {
                    moveJobToReady(job.jobId); // Move job to ReadyJobs if the scheduleTime matches
                }
            });
        };

        const startPollingAtNextMinute = () => {
            const now = new Date();
            const msToNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

            // Set timeout to run checkJobsSchedule at the next full minute
            const timeoutId = setTimeout(() => {
                checkJobsSchedule(); // Initial check when the minute rolls over

                // Set interval to run checkJobsSchedule every minute after the first check
                const intervalId = setInterval(checkJobsSchedule, 60000);

                // Cleanup the interval when the component unmounts
                return () => clearInterval(intervalId);
            }, msToNextMinute);

            // Cleanup the timeout when the component unmounts
            return () => clearTimeout(timeoutId);
        };

        const cleanup = startPollingAtNextMinute(); // Start the polling mechanism

        // Cleanup function to clear both timeout and interval when the component unmounts
        return () => cleanup();
    }, [waitingJobs, moveJobToReady]); // Only re-run when waitingJobs or moveJobToReady changes


    // Memoize moveJobToRunning using useCallback
    const moveJobToRunning = useCallback(async (jobId) => {
        try {
            // Fetch the job from ReadyJobs instead of WaitingJobs
            const jobData = await fetch(`http://localhost:3000/jobs/readyJobs/getJobById/${jobId}`); 
            const job = await jobData.json();
            console.log("Moving this job from ready to running: ", job);

            if (job.resumeJob === "Resume") {
                const availableCluster = await fetch(`http://localhost:3000/management/pools/findClusterAndUpdate`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(job)
                });
                console.log("Available cluster HERE: ", availableCluster);
                
                const result = await availableCluster.json();
                console.log("Result HERE: ", result);
                if (result.success) {
                    // API to insert the job into RunningJobs
                    await fetch(`http://localhost:3000/jobs/runningJobs/addJob`, { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(job), // assuming job object is enough to insert it
                    });
                    console.log(`Job ${jobId} moved from ReadyJobs to RunningJobs`);
                    
                    // API to delete the job from ReadyJobs
                    await fetch(`http://localhost:3000/jobs/readyJobs/deleteJobById/${jobId}`, { 
                        method: 'DELETE',
                    });
                    console.log(`Job ${jobId} deleted from ReadyJobs`);
                    
                    handleJobDeleted(); // Update the ready jobs and running jobs lists
                }
                else {
                    // throw new Error(`HTTP error! status: ${availableCluster.status}`);
                    console.log('Error finding available cluster.');
                }
            }
            
        } catch (error) {
            console.error(`Error moving job ${jobId} to RunningJobs:`, error);
        }
    }, []); 


    // Effect to run jobs when example array changes
    useEffect(() => {
        const processJobs = async () => {
            if (example.current.length === 0) return; // No jobs to process

            for (const job of example.current) {
                try {
                    console.log(`Processing job ${job.jobId}...`);
                    await moveJobToRunning(job.jobId); // Assuming this moves the job to running

                    console.log(`Job ${job.jobId} has been moved to running.`);
                } catch (error) {
                    console.error(`Error processing job ${job.jobId}:`, error);
                }
            }

            // Clear the example array after processing all jobs
            example.current = [];
        };

        processJobs();
    }, [trigger, moveJobToRunning]);  // Re-run the effect whenever trigger changes (new job added)



   



    const handleJobAdded = async (newJob) => {
        try {
            // If the added job's scheduleType is 'Immediately', move it to ReadyJobs
            if (newJob && newJob.jobRunType === 'Immediately') {
                await moveJobToReady(newJob.jobId); // Move the job to ReadyJobs
            }
            // Update the waiting jobs and ready jobs lists as usual
            const updatedWaitingJobs = await fetchWaitingJobsData();
            const updatedReadyJobs = await fetchReadyJobsData();
            setWaitingJobs(updatedWaitingJobs);
            setReadyJobs(updatedReadyJobs);
            
        } catch (error) {
            console.error('Error handling added job:', error);
        }
    };

    const handleJobDeleted = async () => {
        try {
            const updatedWaitingJobs = await fetchWaitingJobsData();
            const updatedReadyJobs = await fetchReadyJobsData();
            const updatedRunningJobs = await fetchRunningJobsData();
            setWaitingJobs(updatedWaitingJobs);
            setReadyJobs(updatedReadyJobs);
            setRunningJobs(updatedRunningJobs);
        } catch (error) {
            console.error('Error fetching updated jobs (after deleting):', error);
        }
    };

    const handleSaveJob = async (newJob) => {
        setIsEditFormOpen(false);
        try {
            if (newJob && newJob.jobRunType === 'Immediately') {
                await moveJobToReady(newJob.jobId); // Move the job to ReadyJobs
            }
            const updatedWaitingJobs = await fetchWaitingJobsData();
            const updatedReadyJobs = await fetchReadyJobsData();
            setWaitingJobs(updatedWaitingJobs);
            setReadyJobs(updatedReadyJobs);
        } catch (error) {
            console.error('Error fetching updated jobs (after updating):', error);
        }
    };

    const openForm = () => setIsFormOpen(true);
    const closeForm = () => setIsFormOpen(false);

    const openEditForm = (job) => {
        setEditingJob(job);
        setIsEditFormOpen(true);
    };
    const closeEditForm = () => setIsEditFormOpen(false);

    const openDeleteForm = (job) => {
        setDeletingJob(job);
        setIsDeleteFormOpen(true);
    };

    const closeDeleteForm = () => {
        setIsDeleteFormOpen(false);
        setDeletingJob(null);
    };
    
    const changeResumeJob = async (job) => {
        if (job.resumeJob === "Pause") {
            job.resumeJob = "Resume";
        }
        else {
            job.resumeJob = "Pause";
        }
        try {
            if (job.status === "Waiting") {
                await fetch(`http://localhost:3000/jobs/waitingJobs/updateJobById/${job.jobId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(job)
                });
                console.log(`Job ${job.jobId} from waiting is ${job.resumeJob}d`);
                const updatedWaitingJobs = await fetchWaitingJobsData();
                setWaitingJobs(updatedWaitingJobs);
            }
            else {
                await fetch(`http://localhost:3000/jobs/readyJobs/updateJobById/${job.jobId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(job)
                });
                console.log(`Job ${job.jobId} from ready is ${job.resumeJob}d`);
                const updatedReadyJobs = await fetchReadyJobsData();
                setReadyJobs(updatedReadyJobs);
            }
        }
        catch (error) {
            console.error('Error changing job status:', error);
        }
    };

    const isPaused =  (job) => {
        if (job.resumeJob === "Pause") {
            return true;
        }
        else {
            return false;
        }
    };

    const [durations, setDurations] = useState({}); // Store durations for running jobs
    const timersStartedRef = useRef({}); // Track if timers have started for jobs
 

     // Function to save job duration to the server
     const saveDuration = async (jobId, formattedDuration) => {
        try {
            const response = await fetch(`http://localhost:3000/jobs/runningJobs/updateDurationById/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ duration: formattedDuration }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update duration for job ${jobId}: ${response.statusText}`);
            }

            console.log(`Duration for job ${jobId} updated to ${formattedDuration}.`);
        } catch (error) {
            console.error(error);
        }
    };

    // Function to initialize job duration and timer
    const startTimer = (jobId) => {
        if (timersStartedRef.current[jobId]) {
            return; // Timer already started for this job
        }

        timersStartedRef.current[jobId] = true; // Mark timer as started

        const min_duration = 20;
        const max_duration = 50;
        const randomDuration = Math.floor(Math.random() * (max_duration - min_duration + 1)) + min_duration; // Random duration between 10-20 seconds
        console.log(`Job ${jobId} will run for ${randomDuration} seconds`);

        setDurations((prev) => ({
            ...prev,
            [jobId]: { seconds: 0, duration: randomDuration }, // Initialize seconds and duration
        }));

        const intervalId = setInterval(() => {
            setDurations((prev) => {
                const currentJob = prev[jobId];
                if (!currentJob) return prev; // Prevent errors if jobId doesn't exist

                const newSeconds = currentJob.seconds + 1;

                // Stop the timer if it reaches the random duration
                if (newSeconds >= currentJob.duration) {
                    clearInterval(intervalId); // Clear the interval
                    console.log(`Job ${jobId} has run for ${newSeconds} seconds`); // Log the final duration

                    // Format duration and save to the server
                    const formattedDuration = formatTime(newSeconds);
                    saveDuration(jobId, formattedDuration);

                    timersStartedRef.current[jobId] = false; // Reset the flag
                    return { ...prev, [jobId]: { seconds: newSeconds } }; // Update without intervalId
                }

                return { ...prev, [jobId]: { seconds: newSeconds, duration: currentJob.duration } };
            });
        }, 1000);

        // Save the interval ID to allow clearing later
        setDurations((prev) => ({
            ...prev,
            [jobId]: { ...prev[jobId], intervalId }, // Store the interval ID
        }));
    };

    // Effect to start timers for running jobs
    useEffect(() => {
        runningJobs.forEach((job) => {
            if (job.status === "Running" && !timersStartedRef.current[job.jobId]) {
                console.log(`Starting timer for job ${job.jobId}`);
                startTimer(job.jobId); // Start the timer if it’s a new running job
                // ********************************************************************
                // MOVE THE JOB TO COMPLETED
                // ********************************************************************
            }
        });

        // Cleanup function to clear intervals when component unmounts or jobs change
        return () => {
            Object.keys(durations).forEach((jobId) => {
                if (durations[jobId]?.intervalId) {
                    clearInterval(durations[jobId].intervalId);
                    timersStartedRef.current[jobId] = false; // Reset the flag when clearing the interval
                }
            });
        };
    }, [runningJobs]); // Runs every time runningJobs changes

    
    const formatTime = (seconds) => {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    };


    const renderJobRow = (job) => {
        return (
            <tr key={job.jobId}>
                <td>{job.jobId}</td>
                <td>{job.jobName}</td>
                {/* <td dangerouslySetInnerHTML={{ __html: formatTestsToRun(job.testsToRun) }}></td> */}
                <td>{job.testToRun}</td>
                <td>{job.resourcePool}</td>
                <td>{job.buildVersion}</td>
                <td>{job.jobRunType}</td>
                <td>{job.scheduleType}</td>
                <td>{job.scheduleTime}</td>
                <td>{job.priorityLevel}</td>                
                <td>{job.createdDate}</td>
                <td>{job.createdTime}</td>
                <td>{job.activationStatus}</td>
                <td>{job.estimatedTime}</td>
    
                {/* Pause/Resume button for Waiting or Ready statuses */}
                {(job.status === "Waiting" || job.status === "Ready") && (
                    <td>
                        <button className="action-btn pause-resume-btn" onClick={() => changeResumeJob(job)}>
                            {isPaused(job) ? (
                                <img src={resumeIcon} alt="Resume" className="icon" />
                            ) : (
                                <img src={pauseIcon} alt="Pause" className="icon" />
                            )}
                        </button>
                    </td>
                )}
    
                {/* "Edit" button for Waiting or Ready status */}
                {(job.status === "Waiting" || job.status === "Ready") && (
                    <td>
                        <button className="action-btn edit-btn" onClick={() => openEditForm(job)}>Edit</button>
                    </td>
                )}
    
                {/* "Delete" button for Waiting or Ready statuses */}
                {(job.status === "Waiting" || job.status === "Ready") && (
                    <td>
                        <button className="action-btn delete-btn" onClick={() => openDeleteForm(job)}>Delete</button>
                    </td>
                )}

                {/* Duration for Running status */}
                {job.status === "Running" && (
                    // <td>{job.duration}</td>
                    <td>{durations[job.jobId] ? formatTime(durations[job.jobId].seconds) : "00:00:00"}</td>
                    

                )}
            </tr>
        );
    };


    
    return (
        <div className="jobs-container">
            <h1>Jobs</h1>
            <button className="add-job-btn" onClick={openForm}>Add Job</button>
            {isFormOpen && <JobForm closeForm={closeForm} onJobAdded={handleJobAdded} />}
            
            <div className="table-container">
                <h2>Waiting Jobs</h2>
                <table className="jobs-table waiting-jobs">
                    <thead>
                        <tr>
                            <th>Job ID</th>
                            <th>Job Name</th>
                            <th>Test to Run</th>
                            <th>Resource Pool</th>
                            <th>Build Version</th>
                            <th>Job Run Type</th>
                            <th>Schedule Type</th>
                            <th>Schedule Time</th>
                            <th>Priority Level</th>
                            <th>Created Date</th>
                            <th>Created Time</th>
                            <th>Activation Status</th>
                            <th>Estimated Time</th>
                            <th>Pause/ Resume</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waitingJobs.map((job) => renderJobRow(job))}
                    </tbody>
                </table>

                <h2>Ready Jobs</h2>
                <table className="jobs-table ready-jobs">
                    <thead>
                        <tr>
                            <th>Job ID</th>
                            <th>Job Name</th>
                            <th>Test to Run</th>
                            <th>Resource Pool</th>
                            <th>Build Version</th>
                            <th>Job Run Type</th>
                            <th>Schedule Type</th>
                            <th>Schedule Time</th>
                            <th>Priority Level</th>
                            <th>Created Date</th>
                            <th>Created Time</th>
                            <th>Activation Status</th>
                            <th>Estimated Time</th>
                            <th>Pause/ Resume</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {readyJobs.map((job) => renderJobRow(job))}
                    </tbody>
                </table>

                <h2>Running Jobs</h2>
                <table className="jobs-table running-jobs">
                    <thead>
                        <tr>
                            <th>Job ID</th>
                            <th>Job Name</th>
                            <th>Test to Run</th>
                            <th>Resource Pool</th>
                            <th>Build Version</th>
                            <th>Job Run Type</th>
                            <th>Schedule Type</th>
                            <th>Schedule Time</th>
                            <th>Priority Level</th>
                            <th>Created Date</th>
                            <th>Created Time</th>
                            <th>Activation Status</th>
                            <th>Estimated Time</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runningJobs.map((job) => renderJobRow(job))}
                    </tbody>
                </table>
            </div>

            {/* Conditional rendering for Edit and Delete forms */}
            {isEditFormOpen && editingJob && (
                <EditJobForm job={editingJob} closeForm={closeEditForm} saveJob={handleSaveJob} />
            )}

            {isDeleteFormOpen && deletingJob && (
                <DeleteJobForm job={deletingJob} closeForm={closeDeleteForm} deleteJob={handleJobDeleted} />
            )}
        </div>
    );
};

export default Jobs;

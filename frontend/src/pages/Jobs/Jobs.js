
import React, { useState, useEffect, useCallback } from 'react';
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


const Jobs = () => {
    const [waitingJobs, setWaitingJobs] = useState([]);
    const [readyJobs, setReadyJobs] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [deletingJob, setDeletingJob] = useState(null);

    // Fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const waitingJobsData = await fetchWaitingJobsData();
                const readyJobsData = await fetchReadyJobsData();
                setWaitingJobs(waitingJobsData);
                setReadyJobs(readyJobsData);
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

    // // Listener for when readyJobs has jobs
    // useEffect(() => {
    //     if (readyJobs.length > 0) {
    //         console.log("Hello:)")
    //         try {
    //             const job = readyJobs[0];
    //             console.log(`Job ${job.jobId} is running...`);
    //             // if (job.jobRunType === 'Immediately') {
    //             //     console.log(`Job ${job.jobId} is ready to run immediately`);
    //             //     // Call the API to run the job immediately
    //             //     fetch(`http://localhost:3000/jobs/readyJobs/runJobById/${job.jobId}`, {
    //             //         method: 'PUT',
    //             //         headers: {
    //             //             'Content-Type': 'application/json'
    //             //         }
    //             //     });
    //             //     console.log(`Job ${job.jobId} is running...`);
    //             // }
    //         } catch (error) {
    //             console.error('Error running job:', error);
    //         }   
    //     }
    // }, [readyJobs]); // This useEffect will run when readyJobs changes

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
            setWaitingJobs(updatedWaitingJobs);
            setReadyJobs(updatedReadyJobs);
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


    // const formatTestsToRun = (tests) => {
    //     // Check if tests is an array and is not empty
    //     if (!tests || !Array.isArray(tests) || tests.length === 0) return '-';
    
    //     // Format each test individually, removing commas and adding <br> tags
    //     const formattedTests = tests
    //         .map((test, index) => `${index + 1}) ${test.replace(/,/g, '')}`)
    //         .join('<br />');
    
    //     return formattedTests;
    // };

    const renderJobRow = (job, isWaiting) => {
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
                <td>
                <button className="action-btn pause-resume-btn" onClick={() => changeResumeJob(job)}>
                    {isPaused(job) ? (
                    <img src={resumeIcon} alt="Resume" className="icon" />
                    ) : (
                    <img src={pauseIcon} alt="Pause" className="icon" />
                    )}
                </button>
                </td>
                {isWaiting && (
                    <td>
                        <button className="action-btn edit-btn" onClick={() => openEditForm(job)}>Edit</button>
                    </td>
                )}
                {!isWaiting && (
                    <td>
                        <button className="action-btn edit-btn" onClick={() => openEditForm(job)}>Edit</button>
                    </td>
                )}
                <td>
                    <button className="action-btn delete-btn" onClick={() => openDeleteForm(job)}>Delete</button>
                </td>
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
                            <th>Tests to Run</th>
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
                        {waitingJobs.map((job) => renderJobRow(job, true))}
                    </tbody>
                </table>

                <h2>Ready Jobs</h2>
                <table className="jobs-table ready-jobs">
                    <thead>
                        <tr>
                            <th>Job ID</th>
                            <th>Job Name</th>
                            <th>Tests to Run</th>
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
                        {readyJobs.map((job) => renderJobRow(job, false))}
                    </tbody>
                </table>
            </div>

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

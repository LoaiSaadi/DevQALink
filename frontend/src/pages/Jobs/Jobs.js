
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Jobs.css';
import JobForm from './JobForm';
import EditJobForm from './EditJobForm';
import DeleteJobForm from './DeleteJobForm';
import pauseIcon from './pause.png'; // Adjust the relative path as needed
import resumeIcon from './play-buttton.png';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is imported



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

const fetchCompletedJobsData = async () => {
    try {
        const response = await fetch('http://localhost:3000/jobs/completedJobs/allCompletedJobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching completed jobs data:', error);
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

const Jobs = () => {
    const [waitingJobs, setWaitingJobs] = useState([]);
    const [readyJobs, setReadyJobs] = useState([]);
    const [runningJobs, setRunningJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [deletingJob, setDeletingJob] = useState(null);

    // const readyJobsQueue = useRef(new Array());
    const readyJobsQueue = useRef([]);  // This holds the jobs ready to be processed
    const [trigger, setTrigger] = useState(0); // A state to trigger re-renders

    const [clusters, setClusters] = useState([]);

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


    // Fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const waitingJobsData = await fetchWaitingJobsData();
                const readyJobsData = await fetchReadyJobsData();
                const runningJobsData = await fetchRunningJobsData();
                const completedJobsData = await fetchCompletedJobsData();
                const clustersData = await fetchClustersData();
                setWaitingJobs(waitingJobsData);
                setReadyJobs(readyJobsData);
                setRunningJobs(runningJobsData);
                setCompletedJobs(completedJobsData);
                setClusters(clustersData);
            } catch (error) {
                console.error('Error fetching job data:', error);
            }
        };

        fetchData();
    }, []);

    const moveJobToWaiting = useCallback(async (jobId) => {
        try {
            const jobData = await fetch(`http://localhost:3000/jobs/completedJobs/getJobById/${jobId}`); 
            const job = await jobData.json();
            console.log("Moving this job from completed to waiting: ", job);

            // API to insert the job into WaitingJobs
            await fetch(`http://localhost:3000/jobs/waitingJobs/addSameJob`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(job), // assuming jobId is enough to insert it
            });
            console.log(`Job ${jobId} moved from CompletedJobs to WaitingJobs`);
            
            // API to delete the job from CompletedJobs
            await fetch(`http://localhost:3000/jobs/completedJobs/deleteJobById/${jobId}`, { 
                method: 'DELETE',
            });
            console.log(`Job ${jobId} deleted from CompletedJobs`);

            // readyJobsQueue.current.push(job);
            // setTrigger(prev => prev + 1); // Trigger re-render to process the new job

            handleJobDeleted(); // Update the jobs lists
        
        } catch (error) {
            console.error(`Error moving job ${jobId} to WaitingJobs:`, error);

        }
    }, []); // No dependencies, so it will be memoized once and remain stable
    
    // Memoize moveJobToReady using useCallback
    const moveJobToReady = useCallback(async (jobId) => {
        try {
            const jobData = await fetch(`http://localhost:3000/jobs/waitingJobs/getJobById/${jobId}`); 
            const job = await jobData.json();
            console.log("Moving this job from waiting to ready: ", job);

            if (job && job.resumeJob === "Resume") {
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
                
                // .sort((a, b) => a.priorityLevel - b.priorityLevel);
                // readyJobsQueue.current.push(job);

                // await readyJobsQueue.current.push(job);
                // console.log(`readyJobsQueue after pushing ${job.jobId} is :`, readyJobsQueue.current);
                // await readyJobsQueue.current.sort((a, b) => b.priorityLevel - a.priorityLevel);
                // console.log(`readyJobsQueue after sorting ${job.jobId} is :`, readyJobsQueue.current);



                // // Check if the jobId already exists in the queue before pushing it
                // const isDuplicate = readyJobsQueue.current.some(queuedJob => queuedJob.jobId === job.jobId);

                // if (!isDuplicate) {
                //     await readyJobsQueue.current.push(job);
                //     console.log(`readyJobsQueue after pushing ${job.jobId} is:`, readyJobsQueue.current);
                    
                //     await readyJobsQueue.current.sort((a, b) => b.priorityLevel - a.priorityLevel);
                //     console.log(`readyJobsQueue after sorting ${job.jobId} is:`, readyJobsQueue.current);
                // } else {
                //     console.log(`Job ${job.jobId} is already in the queue, not adding it again.`);
                // }



                // Check if the jobId already exists in the queue before pushing it
                const isDuplicate = readyJobsQueue.current.some(queuedJob => queuedJob.jobId === job.jobId);

                if (!isDuplicate) {
                    // Push the new job to the queue
                    readyJobsQueue.current.push(job);
                    console.log(`readyJobsQueue after pushing ${job.jobId} is:`, readyJobsQueue.current);

                    // Sort the queue by priorityLevel (highest priority first)
                    readyJobsQueue.current.sort((a, b) => b.priorityLevel - a.priorityLevel);
                    console.log(`readyJobsQueue after sorting ${job.jobId} by priority is:`, readyJobsQueue.current);
                } else {
                    console.log(`Job ${job.jobId} is already in the queue, not adding it again.`);
                }




                setTrigger(prev => prev + 1); // Trigger re-render to process the new job
                await sleep(1000);

                handleJobDeleted(); // Update the waiting jobs and ready jobs lists
        }
        
        } catch (error) {
            console.error(`Error moving job ${jobId} to ReadyJobs:`, error);
        }
    }, []); // No dependencies, so it will be memoized once and remain stable

    // Polling mechanism to check scheduleTime every minute
    useEffect(() => {
        const checkJobsSchedule = async () => {
            const currentTime = new Date();
            const jerusalemTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Jerusalem',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Ensure 24-hour format
            }).format(currentTime);

            console.log('Checking jobs schedule at Jerusalem time:', jerusalemTime);

            // // Iterate over waitingJobs and check if any job's scheduleTime matches the current time
            // waitingJobs.forEach((job) => {
            //     if (job.jobRunType === "Scheduled" && job.activationStatus === "Activated" && job.scheduleTime === jerusalemTime) {
            //         moveJobToReady(job.jobId); // Move job to ReadyJobs if the scheduleTime matches
            //     }
            // });

            // // Iterate over waitingJobs and check if any job's scheduleTime matches the current time
            // for (const job of waitingJobs) {
            //     if (job && job.jobRunType === "Scheduled" && job.activationStatus === "Activated" && job.scheduleTime === jerusalemTime) {
            //         await moveJobToReady(job.jobId); // Await moving job to ReadyJobs if the scheduleTime matches
            //     }
            // }


            // Step 1: Filter waitingJobs based on the condition
            const jobsToMove = await waitingJobs.filter(job => 
                job && 
                job.jobRunType === "Scheduled" && 
                job.activationStatus === "Activated" && 
                job.scheduleTime === jerusalemTime
            );

            // Step 2: Sort the filtered jobs by priorityLevel in descending order
            jobsToMove.sort((a, b) => b.priorityLevel - a.priorityLevel);

            // Step 3: Pass over the sorted array and move each job to ReadyJobs
            for (const job of jobsToMove) {
                try {
                    await moveJobToReady(job.jobId);
                    console.log(`Moved job ${job.jobId} to ReadyJobs.`);
                } catch (error) {
                    console.error(`Error moving job ${job.jobId} to ReadyJobs:`, error);
                }
            }
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

            if (job && job.resumeJob === "Resume") {
                console.log("Moving this job from ready to running: ", job);
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

                // const jobData = await fetch(`http://localhost:3000/jobs/readyJobs/getJobById/${job.jobId}`); 
                // const job = await jobData.json();
                console.log("Moving this job from ready to running after updating: ", result.newJob);

                if (result.success) {
                    // API to insert the job into RunningJobs
                    await fetch(`http://localhost:3000/jobs/runningJobs/addJob`, { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(result.newJob), // assuming job object is enough to insert it
                    });
                    console.log(`Job ${jobId} moved from ReadyJobs to RunningJobs`);
                    
                    // API to delete the job from ReadyJobs
                    await fetch(`http://localhost:3000/jobs/readyJobs/deleteJobById/${jobId}`, { 
                        method: 'DELETE',
                    });
                    console.log(`Job ${jobId} deleted from ReadyJobs`);
                    
                     // Remove the job from readyJobsQueue (.sort((a, b) => a.priorityLevel - b.priorityLevel);)
                    // readyJobsQueue.current = readyJobsQueue.current.filter(j => j.jobId !== jobId);
                    await readyJobsQueue.current.filter(j => j.jobId !== jobId);
                    console.log('readyJobsQueue after removing:', readyJobsQueue.current);

                    await handleJobDeleted(); // Update the ready jobs and running jobs lists
                }
                else {
                    // throw new Error(`HTTP error! status: ${availableCluster.status}`);
                    console.log('Error finding available cluster.');
                }

                return result.success;
            }
            
        } catch (error) {
            await console.error(`Error moving job ${jobId} to RunningJobs:`, error);
        }
    }, []); 


    // Helper function to pause for a specified duration (in milliseconds)
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


    // // Effect to run jobs when readyJobsQueue array changes
    // useEffect(() => {
    //     const processJobs = async () => {
    //         if (readyJobsQueue.current.length === 0) return; // No jobs to process

    //         // Sleep for 0.5 seconds (500 milliseconds) before starting the loop
    //         // await sleep(1000);
    //         // await readyJobsQueue.current.sort((a, b) => b.priorityLevel - a.priorityLevel);
            

    //         for (const job of readyJobsQueue.current) {
    //             try {
    //                 console.log(`Processing job ${job.jobId}...`);
    //                 await moveJobToRunning(job.jobId); // Assuming this moves the job to running
    //                 // moveJobToRunning(job.jobId); // Assuming this moves the job to running

    //                 console.log(`Job ${job.jobId} has been moved to running.`);
    //             } catch (error) {
    //                 console.error(`Error processing job ${job.jobId}:`, error);
    //             }
    //         }

    //         // Clear the readyJobsQueue array after processing all jobs
    //         if (readyJobsQueue.current.length === 0) {
    //             readyJobsQueue.current = [];
    //         }
    //         else{
    //             processJobs();
    //         }
    //     };

    //     console.log('Processing jobs from readyJobsQueue...');
    //     console.log('readyJobsQueue:', readyJobsQueue.current);
    //     processJobs();
    // }, [trigger, moveJobToRunning]);  // Re-run the effect whenever trigger changes (new job added)



  // Effect to run jobs when readyJobsQueue array changes
    useEffect(() => {
        const processJobs = async () => {
            if (readyJobsQueue.current.length === 0) return; // No jobs to process

            // Sort jobs by priority level before processing
            readyJobsQueue.current.sort((a, b) => b.priorityLevel - a.priorityLevel);

            while (readyJobsQueue.current.length > 0) {
                const job = readyJobsQueue.current[0]; // Always get the highest-priority job (sorted)

                try {
                    console.log(`Processing job ${job.jobId}...`);

                    // Move the job to running (this should also trigger a removal from the readyJobsQueue if successful)
                    const res = await moveJobToRunning(job.jobId);

                    if (res) {
                        // After successfully moving to running, remove the job from the queue
                        readyJobsQueue.current.shift(); // Remove the first (highest-priority) job from the queue
                        console.log(`Job ${job.jobId} has been moved to running and removed from readyJobsQueue.`);
                    } else {
                        console.log(`Job ${job.jobId} couldn't be moved to running (no resources), retrying later.`);
                    }
                } catch (error) {
                    console.error(`Error processing job ${job.jobId}:`, error);
                }

                // Sleep briefly to avoid overwhelming the system (if needed)
                await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay between jobs
            }

            console.log('All jobs in readyJobsQueue have been processed.');
        };

        console.log('Processing jobs from readyJobsQueue...');
        console.log('readyJobsQueue:', readyJobsQueue.current);
        processJobs(); // Start processing jobs when the effect runs

    }, [trigger, moveJobToRunning]);  // Re-run the effect whenever trigger changes (new job added)




    // Memoize moveJobToCompleted using useCallback
    const moveJobToCompleted = useCallback(async (jobId) => {
        try {
            // Fetch the job from RunningJobs instead of ReadyJobs
            const jobData = await fetch(`http://localhost:3000/jobs/runningJobs/getJobById/${jobId}`); 
            const job = await jobData.json();
            console.log("Moving this job from running to completed: ", job);


            // API to insert the job into CompletedJobs
            await fetch(`http://localhost:3000/jobs/completedJobs/addJob`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(job), // assuming jobId is enough to insert it
            });
            console.log(`Job ${jobId} moved from RunningJobs to CompletedJobs`);

            // API to delete the job from RunningJobs
            await fetch(`http://localhost:3000/jobs/runningJobs/deleteJobById/${jobId}`, { 
                method: 'DELETE',
            });
            console.log(`Job ${jobId} deleted from RunningJobs`);

            // readyJobsQueue.current.push(job);
            // setTrigger(prev => prev + 1); // Trigger re-render to process the new job

            handleJobDeleted(); // Update the jobs lists
            
        } catch (error) {
            console.error(`Error moving job ${jobId} to CompletedJobs:`, error);
        }
    }, []); 



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
            const updatedCompletedJobs = await fetchCompletedJobsData();
            setWaitingJobs(updatedWaitingJobs);
            setReadyJobs(updatedReadyJobs);
            setRunningJobs(updatedRunningJobs);
            setCompletedJobs(updatedCompletedJobs);
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
        if (job && job.resumeJob === "Pause") {
            job.resumeJob = "Resume";
        }
        else {
            job.resumeJob = "Pause";
        }
        try {
            if (job && job.status === "Waiting") {
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
        if (job && job.resumeJob === "Pause") {
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

    const freeTheCluster = async (job) => {
        try {
            const response = await fetch(`http://localhost:3000/management/pools/freeCluster`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ job }),
            });

            if (!response.ok) {
                throw new Error(`Failed to free the cluster for job ${job.jobId}: ${response.statusText}`);
            }

            console.log(`Cluster freed for job ${job.jobId}.`);
        } catch (error) {
            console.error(error);
        }
    };

    // Function to initialize job duration and timer
    const startTimer = async (jobId) => {
        if (timersStartedRef.current[jobId]) {
            console.log(`Timer already started for job ${jobId}`);
            return; // Timer already started for this job
        }

        timersStartedRef.current[jobId] = true; // Mark timer as started

        const min_duration = 40;
        const max_duration = 50;
        const randomDuration = Math.floor(Math.random() * (max_duration - min_duration + 1)) + min_duration; // Random duration between 20-50 seconds
        console.log(`Job ${jobId} will run for ${randomDuration} seconds`);

        setDurations((prev) => ({
            ...prev,
            [jobId]: { seconds: 0, duration: randomDuration }, // Initialize seconds and duration
        }));

        // Define intervalId before the interval is created
        let intervalId;

        const finalDuration = await new Promise((resolve) => {
            intervalId = setInterval(() => {
                console.log(`Job ${jobId} is running..`);
                setDurations((prev) => {
                    const currentJob = prev[jobId];
                    if (!currentJob) return prev; // Prevent errors if jobId doesn't exist

                    const newSeconds = currentJob.seconds + 1;

                    // Stop the timer if it reaches the random duration
                    if (newSeconds >= currentJob.duration) {
                        clearInterval(intervalId); // Clear the interval
                        console.log(`Job ${jobId} has run for ${newSeconds} seconds`); // Log the final duration

                        timersStartedRef.current[jobId] = false; // Reset the flag
                        resolve(newSeconds); // Resolve with the final duration
                    }

                    return { ...prev, [jobId]: { seconds: newSeconds, duration: currentJob.duration } };
                });
            }, 1000);
        });

        // Save the interval ID to allow clearing later
        setDurations((prev) => ({
            ...prev,
            [jobId]: { ...prev[jobId], intervalId }, // Store the interval ID
        }));

        return finalDuration; // Return the final duration
    };


    // Effect to start timers for running jobs
    useEffect(() => {
        const startTimers = async () => {
            for (const job of runningJobs) {
                if (job.status === "Running" && !timersStartedRef.current[job.jobId]) {
                    console.log(`Starting timer for job ${job.jobId}`);
                    const finalDuration = await startTimer(job.jobId); // Start the timer and get the final duration
                    // Format duration and save to the server
                    const formattedDuration = formatTime(finalDuration);
                    await saveDuration(job.jobId, formattedDuration);
                    console.log(`Final duration for job ${job.jobId}: ${finalDuration} seconds`);
                    await freeTheCluster(job);

                    await moveJobToCompleted(job.jobId);
                    if (job.jobRunType === "Scheduled" && job.scheduleType === "Reoccurring Job") {
                        console.log(`Job ${job.jobId} is reoccurring, moving it back to WaitingJobs.`);
                        await moveJobToWaiting(job.jobId);
                    }
        
                    setTrigger(prev => prev + 1); // Trigger re-render to process the new job
                    console.log(`LOL`);
                }
            }
        };

        startTimers();

        // Cleanup function to clear intervals when component unmounts or jobs change
        return () => {
            Object.keys(durations).forEach((jobId) => {
                if (durations[jobId]?.intervalId) {
                    console.log(`Cleaning up interval for job ${jobId}`);
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
                <td>{job.testToRun}</td>
                <td>{job.resourcePool}</td>
                <td>{job.buildVersion}</td>
                <td>{job.jobRunType}</td>
                <td>{job.scheduleType}</td>
                <td>{job.scheduleTime}</td>
                <td>{job.priorityLevel}</td>

                {job.status === "Running" && (
                    <td>
                        {(() => {
                            const cluster = clusters.find(cluster => cluster._id === job.runningCluster);
                            return cluster ? cluster.clusterName : '-';
                        })()}
                    </td>
                )}

                {job.status === "Completed" && (
                    <td>{job.runnedOnCluster}</td>
                )}

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

                {job.status === "Completed" && (
                    <td className="job-duration">{job.duration}</td>
                )}

                {job.status === "Completed" && (
                    <td>{job.completedDate}</td>
                )}

                {job.status === "Completed" && (
                    <td>{job.completedTime}</td>
                )}

                {job.status === "Completed" && (
                    <td className={job.testStatus === "Succeeded" ? "test-status-succeeded" : job.testStatus === "Failed" ? "test-status-failed" : ""}>
                        {job.testStatus}
                    </td>
                )}

                {job.status === "Completed" && (
                    <td>{job.failureReason}</td>
                )}

                <td>{job.triggeredBy}</td>
            </tr>
        );
    };


    
    return (
        <div className="jobs-container">
            <h1>Jobs</h1>

            <p style={{ fontSize: '1.2em' }}>
                This section manages various job types within the system. Below are the tables categorizing jobs based on their status:
            </p>
            <div className="job-descriptions">
                <p style={{ fontSize: '1.2em' }}>
                    <strong>Waiting Jobs:</strong> Jobs that are queued and awaiting execution.<br />
                    <strong>Ready Jobs:</strong> Jobs that are ready to run based on their schedule.<br />
                    <strong>Running Jobs:</strong> Jobs currently in execution.<br />
                    <strong>Completed Jobs:</strong> Jobs that have finished running.<br />
                </p>
            </div>


        <div className="separator" /> {/* Separator added here */}

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
                            <th>Triggered By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waitingJobs.map((job) => renderJobRow(job))}
                    </tbody>
                </table>

                <hr style={{ margin: '20px 0' }} />

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
                            <th>Triggered By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {readyJobs.map((job) => renderJobRow(job))}
                    </tbody>
                </table>

                <hr style={{ margin: '20px 0' }} />

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
                            <th>Allocated Cluster</th>
                            <th>Created Date</th>
                            <th>Created Time</th>
                            <th>Activation Status</th>
                            <th>Estimated Time</th>
                            <th>Duration</th>
                            <th>Triggered By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runningJobs.map((job) => renderJobRow(job))}
                    </tbody>
                </table>

                <hr style={{ margin: '20px 0' }} />

                <h2>Completed Jobs</h2>
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
                            <th>Runned On Cluster</th>
                            <th>Created Date</th>
                            <th>Created Time</th>
                            <th>Activation Status</th>
                            <th>Estimated Time</th>
                            <th>Duration</th>
                            <th>Completed Date</th>
                            <th>Completed Time</th>
                            <th>Test Status</th>
                            <th>Failure Reason</th>
                            <th>Triggered By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completedJobs.map((job) => renderJobRow(job))}
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

            <footer className="footer">
                <p>© {new Date().getFullYear()} QA and Dev Scheduling Framework. All rights reserved.</p>
            </footer>
        </div>

        
    );
};

export default Jobs;

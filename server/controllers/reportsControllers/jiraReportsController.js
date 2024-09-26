let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;

exports.openJiraBug = async (req, res) => {
    const job = req.body; // Get the entire job object from the request body

    // Construct the bug report details from the job object
    // ADD             User that triggered it: ${job.triggeredBy}   to the description
    const jobDetails = {
        summary: `Bug for Job: ${job.jobId} - ${job.jobName}`, // You can customize this as needed
        description: `
            Test: ${job.jobName}
            Version-Build: ${job.buildVersion}
            Cluster details: ${job.runnedOnCluster}
            Test result: ${job.testResult ? 'Pass' : 'Fail'}
            Failure reason: ${job.testResult ? 'N/A' : job.failureReason}
            Runtime duration: ${job.duration}
            Date: ${new Date(job.completedDate).toLocaleString()} // Format as needed
        `,
        projectKey: JIRA_PROJECT_KEY,
        issueType: 'Bug',
    };

    console.log('Opening Jira bug with details:', jobDetails);

    const payload = {
        fields: {
            project: {
                key: jobDetails.projectKey,
            },
            summary: jobDetails.summary,
            description: jobDetails.description,
            issuetype: {
                name: jobDetails.issueType,
            },
        },
    };

    console.log('Creating Jira issue with payload:', payload);

    try {
        const response = await fetch(`${JIRA_BASE_URL}/rest/api/2/issue`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const data = await response.json();
            res.status(200).json({ message: 'Jira issue created successfully', issueKey: data.key });
        } else {
            res.status(response.status).json({ error: 'Failed to create Jira issue' });
        }
    } catch (error) {
        console.error('Error creating Jira issue:', error);
        res.status(500).json({ error: 'Server error while creating Jira issue' });
    }
};

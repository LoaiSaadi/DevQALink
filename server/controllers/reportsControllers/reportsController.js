
const User = require('../../models/authModels/authModel'); // Assuming you have a User model
const nodemailer = require('nodemailer');


let fetch;
(async () => {
    fetch = (await import('node-fetch')).default;
})();

const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;

exports.openJiraBug = async (req, res) => {
    const job = req.body; // Get the entire job object from the request body

    // Construct the bug report details from the job object
    const jobDetails = {
        summary: `Bug for Job: ${job.jobId} - ${job.jobName}`, // You can customize this as needed
        description: `
            Test: ${job.jobName}
            Version-Build: ${job.buildVersion}
            Cluster details: ${job.runnedOnCluster}
            Test result: ${job.testStatus}
            Failure reason: ${job.testStatus === "Succeeded" ? '-' : job.failureReason}
            Runtime duration: ${job.duration}
            Date: ${job.completedDate}
            Triggered by: ${job.triggeredBy}
        `,
        projectKey: JIRA_PROJECT_KEY,
        issueType: 'Task',
    };

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


// Create the route to send a report via email
exports.sendReport = async (req, res) => {
    const { job } = req.body; // Get the username and report data from the request

    try {
        // Fetch the user's email by the username
        const user = await User.findOne({ username: job.triggeredBy });

        if (!user || !user.email) {
            return res.status(404).json({ message: 'User or email not found' });
        }

        // Setup nodemailer transporter using environment variables
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,  // Use the service from .env
            auth: {
                user: process.env.EMAIL_USER,  // Email from .env
                pass: process.env.EMAIL_PASSWORD  // Password from .env
            }
        });

        // Compose the email
const mailOptions = {
    from: process.env.EMAIL_USER,  // Use email from .env
    to: user.email,  // User's email from the database
    subject: `Report for Job: ${job.jobId} - ${job.jobName}`, // Updated subject
    text: `Hello ${user.username},\n\nHere is the report for Job ${job.jobId}.\n\n` +
          `Test: ${job.jobName}\n` +
          `Version-Build: ${job.buildVersion}\n` +
          `Cluster Details: ${job.runnedOnCluster}\n` +
          `Test Result: ${job.testStatus}\n` +
          `Failure Reason: ${job.testStatus === "Succeeded" ? '-' : job.failureReason}\n` +
          `Runtime Duration: ${job.duration}\n` +
          `Date: ${job.completedDate}\n` +
          `Triggered by: ${job.triggeredBy}\n\n` +
          `Best regards,\nQA and Dev Scheduling Framework`,
    html: `<p>Hello ${user.username},</p><p>Here is the report for Job <strong>${job.jobId}</strong>.</p><p>` +
          `Test: ${job.jobName}<br/>` +
          `Version-Build: ${job.buildVersion}<br/>` +
          `Cluster Details: ${job.runnedOnCluster}<br/>` +
          `Test Result: ${job.testStatus}<br/>` +
          `Failure Reason: ${job.testStatus === "Succeeded" ? '-' : job.failureReason}<br/>` +
          `Runtime Duration: ${job.duration}<br/>` +
          `Date: ${job.completedDate}<br/>` +
          `Triggered by: ${job.triggeredBy}<br/><br/>` +
          `Best regards,<br/>QA and Dev Scheduling Framework</p>`
};

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Report sent successfully' });
        });

    } catch (error) {
        console.error('Error fetching user or sending email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
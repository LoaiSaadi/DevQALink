// server/models/readyJobModel.js
const { duration } = require('moment-timezone');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const runningJobSchema = new mongoose.Schema({
    jobId: { type: Number },
    jobName: { type: String, required: true },
    testToRun: { type: String, required: true },
    resourcePool: { type: String, required: true },
    buildVersion: { type: String, required: true },
    jobRunType: { type: String, enum: ['Immediately', 'Scheduled'], required: true },
    scheduleType: { type: String, enum: ['One-Time Job', 'Reoccurring Job', '-'], default: '-'},
    scheduleTime: { type: String, default: '-' },
    priorityLevel: { type: Number, min: 1, max: 10, required: true },
    estimatedTime: { type: String, required: true },
    createdDate: { type: String, required: true },
    createdTime: { type: String, required: true },
    status: { type: String, default: 'Running' },
    activationStatus: { type: String, default: 'Activated' },
    resumeJob: { type: String, enum: ['Resume', 'Pause'], default: 'Resume', required: true },
    duration: { type: String, required: true },
    runningCluster: { type: Schema.Types.ObjectId, ref: 'Cluster'},
    triggeredBy : { type: String, required: true },
});

const RunningJob = mongoose.model('RunningJob', runningJobSchema);

module.exports = RunningJob;

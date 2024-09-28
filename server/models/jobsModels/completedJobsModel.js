// server/models/readyJobModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const completedJobSchema = new mongoose.Schema({
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
    status: { type: String, default: 'Completed' },
    activationStatus: { type: String, default: 'Activated' },
    resumeJob: { type: String, enum: ['Resume', 'Pause'], default: 'Resume', required: true },
    duration: { type: String, required: true },
    testStatus: { type: String },
    completedDate: { type: String, required: true },
    completedTime: { type: String, required: true },
    runnedOnCluster: { type: String, required: true },
    failureReason: { type: String },
    triggeredBy : { type: String, required: true },
});

const CompletedJob = mongoose.model('CompletedJob', completedJobSchema);

module.exports = CompletedJob;

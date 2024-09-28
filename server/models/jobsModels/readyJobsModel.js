// server/models/readyJobModel.js
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const readyJobSchema = new mongoose.Schema({
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
    status: { type: String, default: 'Ready' },
    activationStatus: { type: String, default: 'Activated' },
    resumeJob: { type: String, enum: ['Resume', 'Pause'], default: 'Resume', required: true },
    runningCluster: { type: Schema.Types.ObjectId, ref: 'Cluster'},
    triggeredBy : { type: String, required: true },
});

const ReadyJob = mongoose.model('ReadyJob', readyJobSchema);

module.exports = ReadyJob;

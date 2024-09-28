// server/models/waitingJobModel.js
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

const waitingJobSchema = new mongoose.Schema({
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
    status: { type: String, default: 'Waiting' },
    activationStatus: { type: String, default: 'Activated' },
    resumeJob: { type: String, enum: ['Resume', 'Pause'], default: 'Resume', required: true},
    triggeredBy : { type: String, required: true },
});

// Apply auto-increment plugin to the schema
waitingJobSchema.plugin(autoIncrement, { inc_field: 'jobId', start_seq: 1 });

const WaitingJob = mongoose.model('WaitingJob', waitingJobSchema);

module.exports = WaitingJob;

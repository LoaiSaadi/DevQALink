const mongoose = require('mongoose');

const jobIdsSchema = new mongoose.Schema({
    jobIds: { type: [String], required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

const JobIds = mongoose.model('JobIds', jobIdsSchema);
module.exports = JobIds;
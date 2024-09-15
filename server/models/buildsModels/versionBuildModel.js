// server/models/versionBuildModel.js
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);


const versionBuildSchema = new mongoose.Schema({
    buildVersion: { type: String, required: true },
    buildDescription: { type: String, required: true },
    status: { type: String, enum: ['Released', 'In Progress'], default: 'In Progress' },
    createdDate: { type: String, required: true },  // Date in YYYY-MM-DD format
    createdTime: { type: String, required: true },  // Time in HH:MM:SS format
    lastUpdatedDate: { type: String, required: true },  // Date in YYYY-MM-DD format
    lastUpdatedTime: { type: String, required: true },  // Time in HH:MM:SS format
    size: { type: String, required: true },
});

const VersionBuild = mongoose.model('VersionBuild', versionBuildSchema);

module.exports = VersionBuild;

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const clusterSchema = new mongoose.Schema({
    clusterName: { type: String, required: true },
    clusterDescription: { type: String, required: true },
    clusterStatus: { type: String, enum: ['Available', 'Unavailable', 'Running'], default: 'Available' },
    servers: [{ type: Schema.Types.ObjectId, ref: 'Server' }], 
    testRunnerServer: { type: Schema.Types.ObjectId, ref: 'Server' },
    poolConnectedTo: { type: Schema.Types.ObjectId, ref: 'Pool' },
    serversNumber: { type: Number, required: true },
    createdDate: { type: String, required: true },  // Date in YYYY-MM-DD format
    createdTime: { type: String, required: true },  // Time in HH:MM:SS format
});

clusterSchema.plugin(autoIncrement, { inc_field: 'clusterId', start_seq: 1 });

const Cluster = mongoose.model('Cluster', clusterSchema);

module.exports = Cluster;

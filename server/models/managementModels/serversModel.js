// server/models/testModel.js
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const serverSchema = new mongoose.Schema({
    serverIp: { type: String, required: true },
    serverDescription: { type: String, required: true },
    // clusterConnectedTo: { type: Schema.Types.ObjectId, ref: 'Cluster' },
    clusterConnectedTo: { type: String, required: true },

    createdDate: { type: String, required: true },  // Date in YYYY-MM-DD format
    createdTime: { type: String, required: true },  // Time in HH:MM:SS format
});

serverSchema.plugin(autoIncrement, { inc_field: 'serverId', start_seq: 1 });

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const poolSchema = new mongoose.Schema({
    poolName: { type: String, required: true },
    poolDescription: { type: String, required: true },
    poolStatus: { type: String, enum: ['Available', 'Unavailable', 'Running'], default: 'Available' },
    clusters: [{ type: Schema.Types.ObjectId, ref: 'Cluster' }], 
    clustersNumber: { type: Number, required: true },
    serversNumber: { type: Number, required: true },
    createdDate: { type: String, required: true },  // Date in YYYY-MM-DD format
    createdTime: { type: String, required: true },  // Time in HH:MM:SS format
});

poolSchema.plugin(autoIncrement, { inc_field: 'poolId', start_seq: 1 });

const Pool = mongoose.model('Pool', poolSchema);

module.exports = Pool;

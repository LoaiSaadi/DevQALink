// server/models/testModel.js
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);


const testSchema = new mongoose.Schema({
    testTitle: { type: String, required: true },
    testDescription: { type: String, required: true },
    theCode: [{ type: String, required: true }],
    saveAs: { type: String, required: true }
});

testSchema.plugin(autoIncrement, { inc_field: 'testId', start_seq: 1 });

const Test = mongoose.model('Test', testSchema);

module.exports = Test;

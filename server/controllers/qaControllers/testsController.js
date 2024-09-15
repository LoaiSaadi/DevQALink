const Test = require('../../models/qaModels/testsModel');

// Handle GET request to list all tests
exports.getAllTests = async (req, res) => {
    try {
        const tests = await Test.find();
        res.status(200).json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({
            message: 'Error fetching tests',
            error: error.message
        });
    }
};

// Handle POST request to add a new test
exports.addTest = async (req, res) => {
    try {
        const { testTitle, testDescription, theCode, saveAs } = req.body;

        const newTest = new Test({
            testTitle,
            testDescription,
            theCode,
            saveAs,
        });

        const savedTest = await newTest.save();

        res.status(201).json({
            message: 'Test added successfully',
            test: savedTest
        });
    } catch (error) {
        console.error('Error saving test:', error);
        res.status(500).json({
            message: 'Error saving test',
            error: error.message
        });
    }
};

exports.getTestById = async (req, res) => {
    try {
        const testId = req.params.jobId;
        const test = await WaitingJob.findOne({ testId });
        res.status(200).json(test);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteTestById = async (req, res) => {
    console.log('deleteTestById :', req.params);
    try {
        const testId = req.params.testId;

        // Use findOneAndDelete to search by the testId field and delete the document
        const deletedTest = await Test.findOneAndDelete({ testId });
        console.log('deletedTest:', deletedTest);

        if (deletedTest) {
            res.status(200).json({
                message: 'Test deleted successfully',
                test: deletedTest
            });
        } else {
            res.status(404).json({ message: 'Test not found' });
        }
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({
            message: 'Error deleting test',
            error: error.message
        });
    }
};

exports.updateTestById = async (req, res) => {
    console.log('updateTestById :', req.params);
    try {
        const testId = req.params.testId;
        const {
            testTitle,
            testDescription,
            theCode,
            saveAs
        } = req.body;

        const updatedTest = await Test.findOneAndUpdate(
            { testId },
            {
                testTitle,
                testDescription,
                theCode,
                saveAs
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Test updated successfully',
            test: updatedTest
        });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({
            message: 'Error updating test',
            error: error.message
        });
    }
};
const VersionBuild = require('../../models/buildsModels/versionBuildModel');

exports.getAllVersionBuilds = async (req, res) => {
    try {
        const versionBuilds = await VersionBuild.find();
        res.status(200).json(versionBuilds);
    } catch (error) {
        console.error('Error fetching version builds:', error);
        res.status(500).json({
            message: 'Error fetching version builds',
            error: error.message
        });
    }
};

// Create multiple new version builds
exports.createVersionBuilds = async (req, res) => {
    try {
        // Expecting an array of version builds in the request body
        const newVersionBuilds = req.body; // This should be an array

        // Insert multiple version builds
        const savedBuilds = await VersionBuild.insertMany(newVersionBuilds);
        res.status(201).json({
            message: 'Version builds created successfully',
            builds: savedBuilds
        });
    } catch (error) {
        console.error('Error creating version builds:', error);
        res.status(500).json({
            message: 'Error creating version builds',
            error: error.message
        });
    }
};

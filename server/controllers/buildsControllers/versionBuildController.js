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
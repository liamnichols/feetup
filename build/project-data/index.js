const path = require('path');

/// Reads a project.json file from within the specified directory and returns it
exports.read = function(workspace) {
    
    // get the absolute path to the json file
    var filepath = path.join(workspace, 'project.json');
    
    return filepath
}

/// Validates the read project data (read from read) against the specified platform
exports.validate = function(projectData, platform) {
    
}

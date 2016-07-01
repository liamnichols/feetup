const path = require('path');

/// Validates the project.json file
exports.validate = function(project) {
    
    // throw any errors here if project isn't what we expect it to be
    
    // check for the xcworkspace 
    if (project.workspace == null) {
        throw new Error("Missing 'workspace'")
    }
}

exports.build = function(project, workspace) {

    // get the workspace and log it
    var xcworkspacePath = path.join(workspace, project.workspace)
    console.log("[ios] Workspace: " + xcworkspacePath)
}

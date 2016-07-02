const path = require('path');

/// Reads the decoded Projfile data, validate and returns any relevant data for the actions
exports.load = function(projfile, dir) {
    
    // ensure the ios platform is defined in the Projfile
    if (projfile.platforms.ios == null) {
        throw new Error("Platform 'ios' is not defined in Projfile")
    } 
    
    // resolve the .xcworkspace file defined in the project
    var workspace = require("./xcworkspace")(path.join(dir, projfile.platforms.ios.workspace))
    
    console.log("[ios] Read workspace:")
    console.log(workspace.projects[0].sharedSchemes)
}

/// The archive action for this platform
exports.archive = function(projfile, data, dir) {

    // 
}

/// The test action for this platform
exports.test = function(projfile, data, dir) {

    // 
}

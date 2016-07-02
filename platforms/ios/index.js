const path = require('path');
const xcodebuild = require("./xcodebuild")

/// Reads the decoded Projfile data, validate and returns any relevant data for the actions
exports.load = function(projfile, dir) {
    
    // ensure the ios platform is defined in the Projfile
    if (projfile.platforms.ios == null) {
        throw new Error("Platform 'ios' is not defined in Projfile")
    } 
    
    // resolve the .xcworkspace file defined in the project
    var workspace = require("./xcworkspace")(path.join(dir, projfile.platforms.ios.workspace))
    
    // return the loaded info
    return {
        workspace: workspace,
        derivedDataPath: path.join(dir, "DerivedData"),
        exportsPath: path.join(dir, "build/EXPORTS")
    }
}

/// Executes tasks for this platform
exports.execute = function (projfile, data, dir, actions) {
    
    // to save us reading the whole projfile each time
    var ios = projfile.platforms.ios
    
    // if we want to test
    if (actions.test == true) {
        
        // make sure there are test schemes defined in the Projfile as we require at least one
        if (ios.tests.schemes.count == 0) {
            throw new Error("Attempting to run test action but Projfile doesn't specify any test schemes to run.")
        }
        
        // enumerate each scheme as we are about to test it
        for (schemeName of ios.tests.schemes) {
            
            // find the scheme
            var scheme = findScheme(schemeName, data.workspace)
        
            // get the variables we need
            var workspacePath = data.workspace.path
            var schemeName = scheme.name
            var configuration = scheme.actions.test.configuration
            var derivedDataPath = data.derivedDataPath
            
            // now we wnat to test or build this scheme
            if (ios.tests.dryRun == true) {
                
                // use the build command
                xcodebuild.build(workspacePath, schemeName, configuration, derivedDataPath, true)
                
            } else {
                
                // read the destinations
                var destinations = null // TODO: read these into whatever we pass into xcodebuild
                
                // use the test command
                xcodebuild.test(workspacePath, schemeName, configuration, derivedDataPath, destinations)
            }
        }
    }
    
    // TODO: archive where needed
}

function findScheme(name, workspace) {
    
    // enumerate each project
    for (project of workspace.projects) {
        
        // make sure this project has schemes
        if (project.sharedSchemes) {
            
            // enumerate the projects schemes
            for (scheme of project.sharedSchemes) {
                
                // check the name
                if (scheme.name == name) {
                    
                    // return the scheme
                    return scheme
                }
            }
        }
    }
    
    // throw an error as we couldn't find the scheme
    throw new Error("Unable to find scheme named '" + name + "'. Is it shared in the .xcodeproj?")
}

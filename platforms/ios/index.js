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
        exportsPath: path.join(dir, "build/feetup/exports")
    }
}

/// Executes tasks for this platform
exports.execute = function (projfile, data, dir, opts) {
    
    // to save us reading the whole projfile each time
    var ios = projfile.platforms.ios
    
    // if we want to test
    if (opts.actions.test == true) {
        
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
    
    // check if we also want to perform an acrhive 
    if (opts.actions.archive == true) {
        
        // read the archives from the projfile
        var archives = archivesFromProjfile(projfile, opts)
        
        // make sure we actually have some
        if (archives.count == 0) {
            throw new Error("Attempting to run action action but Projfile doesn't specify any archives to run for this configuration.")
        }
        
        // enumerate each archive to perform the actions
        for (archive of archives) {
            
            // find the scheme
            var scheme = findScheme(archive.scheme, data.workspace)
            
            // get any variables we need
            var workspacePath = data.workspace.path
            var schemeName = scheme.name
            var configuration = scheme.actions.test.configuration
            var derivedDataPath = data.derivedDataPath
            var exportsPath = data.exportsPath
            var archivePath = path.join(exportsPath, schemeName, schemeName + ".xcarchive")
            
            // TODO: reset the git repo
            
            // TODO: set the build number
            
            // TODO: tag an icon if needed
            
            // TODO: archive the project
            xcodebuild.archive(workspacePath, schemeName, configuration, derivedDataPath, archivePath, true)
            
            // TODO: process the archive (symbols)
            
            // TODO: export the archive
            
            // TODO: proces the ipa (info.plist, icon etc)
        }
    }
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

function archivesFromProjfile(projfile, opts) {
    
    // somewhere to store them
    var archives = Array()
    
    // enumerate each archive
    for (archive of projfile.platforms.ios.archives) {
        
        // filter against nightly
        if (opts.nightly == (archive.nightly == true)) {
            
            // add to the return Array
            archives.push(archive)
        }
    }
    
    // return the archives
    return archives
}

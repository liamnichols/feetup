const path = require('path')
const child_process = require('child_process')
const XCAssets = require('./xcassets')

exports.setBuildNumber = function(buildNumber, dir, buildSettings, targets) {
    
    // enumerate each target
    for (target of targets) {
        
        // log what we are doing
        console.log("[modifying] setBuildNumber: ", buildNumber, " - Target: ", target.name)
        
        // get the plist path
        var infoPlistFile = buildSettings[target.name]["INFOPLIST_FILE"]
        
        // make sure it exists
        if (infoPlistFile == null) {
            
            // log a warning
            console.warn("[modifying]  Warning: target '" + target.name + "' does not have a INFOPLIST_FILE build setting. Skipping")
            
            // move onto the next target
            continue
        }
        
        // get the plist path
        var infoPlistPath = path.join(dir, infoPlistFile)
        
        // build the args
        var args = [
            "-replace",
            "CFBundleVersion",
            "-string",
            String(buildNumber),
            infoPlistPath
        ]
        
        // update the value
        var output = child_process.spawnSync("plutil", args, {
            stdio: [ 0, 1, 2 ]
        })
        
        // check for errors
        if (output.error != null) {
            
            // throw the error
            throw output.error
        }
    }
}

exports.tagAppIconInProject = function(project, buildSettings, targets, tagOpts) {
    
    // enumerate each target to find it's asset catalog
    for (target of targets) {
        
        // make sure we have an asset catalog based app icon for each target
        if (buildSettings[target.name]["ASSETCATALOG_COMPILER_APPICON_NAME"] == null) {
            
            // log a warning
            console.warn("[modifying] Skipping icon tag for target", target.name, "- Build settings do not contain ASSETCATALOG_COMPILER_APPICON_NAME")
            
            // move onto the next target
            continue
        }
        
        // store the name
        var appIconName = buildSettings[target.name]["ASSETCATALOG_COMPILER_APPICON_NAME"]
        
        // search the copy resources build phase
        var copyResources = target.buildPhaseWithType("PBXResourcesBuildPhase")
        
        // make sure it was there
        if (copyResources == null) {
            
            // log a warning
            console.warn("[modifying] Skipping icon tag for target", target.name, "- Target does not contain PBXResourcesBuildPhase build phase")
            
            // move onto the next target
            continue
        }
        
        // enumerate the phases files to look for folder.assetcatalog, then search it.
        for (file of copyResources.files) {
        
            // check if it was an asset catalog
            if (file.lastKnownFileType == "folder.assetcatalog") {
                
                // work out the absolute catalog path
                var catalogPath = path.join(path.dirname(project.path), file.getRealPath())
            
                // load it
                var catalog = new XCAssets(catalogPath)
                
                // search for the asset name
                var appIconSet = catalog.appIconSets[appIconName]
                
                // check if we found the icon set
                if (appIconSet != null) {
                    
                    // log it
                    console.log("[modifying] Found AppIconSet:", appIconSet.path)
                    
                    // tag each image
                    for (image of appIconSet.images) {
                        
                        // get the path
                        var imagePath = appIconSet.pathToImage(image)
                        
                        // tag the image
                        console.log("[modifying] Tagging image:", imagePath)
                        
                        // TODO: work out how to actually tag this image in node
                    }
                    
                    // we're finished
                    return
                }
            }
        }
    }
}

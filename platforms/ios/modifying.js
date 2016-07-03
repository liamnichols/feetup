const path = require('path')
const child_process = require('child_process')

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
        child_process.spawnSync("plutil", args, {
            stdio: [ 0, 1, 2 ]
        })
    }
}

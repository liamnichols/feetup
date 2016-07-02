const path = require('path')
const child_process = require('child_process')

exports.setBuildNumber = function(buildNumber, dir, buildSettings) {
    
    // enumerate each target
    for (var target in buildSettings) {
        
        // make sure it's a target? js stuff..
        if (buildSettings.hasOwnProperty(target)) {
            
            // log what we are doing
            console.log("[modifying] setBuildNumber: ", buildNumber, " - Target: ", target)
            
            // get the plist path
            var infoPlistFile = buildSettings[target]["INFOPLIST_FILE"]
            
            // make sure it exists
            if (infoPlistFile == null) {
                
                // log a warning
                console.warn("[modifying]  Warning: target '" + target + "' does not have a INFOPLIST_FILE build setting. Skipping")
                
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
}

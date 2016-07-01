module.exports = function(workspace, platform) {
    
    // work through the platforms as we will load the build module for this platform
    if (platform != "ios")
    {
        console.log("Unsupported platform '" + platform + "'")
        return
    }
    
    // just log what is going on
    console.log("Loading project with target platform of '" + platform + "'")
    
    // load the project
    
}

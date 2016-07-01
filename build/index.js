module.exports = function(workspace, platform) {
    
    // work through the platforms as we will load the build module for this platform
    if (platform != "ios")
    {
        throw new Error("Unsupported platform '" + platform + "'")
    }
    
    // just log what is going on
    console.log("Loading project with target platform of '" + platform + "'")
    
    // load the project-data module and read the data
    var projectData = require("./project-data")(workspace)
    
    // log the settings for now
    console.log(projectData);
}

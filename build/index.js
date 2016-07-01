module.exports = function(workspace, platformName) {
    
    // load the platform module
    var platform = require("./platforms/" + platformName)
    
    // load the project-data module and read the data
    var project = require("./project-data")(workspace)
    
    // validate the project against the platform
    platform.validate(project)
    
    // build against the platform
    platform.build(project, workspace)
}

const xcscheme = require('./xcscheme.js')

/// Loads a .xcodeproj file at the specified path
module.exports = function(bundlePath) {
    
    // return the xcodeproj object
    return {
        path: bundlePath,
        schemes: xcscheme.schemesFromProject(bundlePath)
    }
}

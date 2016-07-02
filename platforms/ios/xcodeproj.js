const xcscheme = require('./xcscheme.js')
const pbxproj = require('./pbxproj.js')

/// Loads a .xcodeproj file at the specified path
module.exports = function(bundlePath) {
    
    // return the xcodeproj object
    return {
        path: bundlePath,
        schemes: xcscheme.read(bundlePath),
        pbxproj: pbxproj.readRootObject(bundlePath)
    }
}

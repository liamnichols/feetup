const xcscheme = require('./xcscheme.js')
const PBXProj = require('./pbxproj.js')

/// Loads a .xcodeproj file at the specified path
module.exports = function(bundlePath) {
    
    // load the pbxproj
    var pbxproj = new PBXProj(bundlePath)
    
    // store properties on the XcodeProject (join schemes with the pbxproj stuff)
    this.path = bundlePath
    this.schemes = xcscheme.read(bundlePath)
    this.targets = pbxproj.targets
    this.navigator = pbxproj.mainGroup
}

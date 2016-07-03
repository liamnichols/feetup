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
    
    this.targetWithId = function(id) {
        
        // enumerate the targets
        for (target of this.targets) {
            
            // check the id
            if (target.id == id) {
                
                // return the target
                return target
            }
        }
        
        // we couldn't find it
        return null
    }
    
    this.schemeWithName = function(name) {
        
        // enumerate each scheme
        for (scheme of this.schemes) {
            
            // check the name
            if (scheme.name == name) {
                
                // return the scheme
                return scheme
            }
        }
        // reutrn null
        return null
    }
    
    /// Works out the targets used in the specified scheme name and returns them
    this.getBuildTargetsForScheme = function(scheme, buildingFor) {
        
        // somewhere to keep our targets
        var targets = Array()
        
        // enumerate the entries
        for (entry of scheme.actions.build.entries) {
            
            // make sure this mode is being built for
            if (entry.buildsFor[buildingFor] == true) {
                    
                // push the actual target object into the array
                targets.push(this.targetWithId(entry.target.identifier))
            }
        }
        
        // return the targets
        return targets
    }
}

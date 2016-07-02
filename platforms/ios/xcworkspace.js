const path = require('path');

/// Loads a .xcworkspace file at the specified path
module.exports = function(bundlePath) {

    // work out the xcworkspacedata file path
    var filepath = path.join(bundlePath, "contents.xcworkspacedata")
    
    // read the file
    var fs = require('fs')
    var xmlString = fs.readFileSync(filepath, 'utf8')
    
    // get the xml parser
    var parseString = require('xml2js').parseString;
    
    // somwhere to hold the xml
    var xml
    
    // parse it (this is sync)
    parseString(xmlString, function(err, result) {
            
        // throw an error if there wasone
        if (err != null) {
            throw err
        } 
        
        // pass the xml back
        xml = result
    })
    
    // array of files
    var files = Array()
    
    // the directory of the xcworkspace
    var bundleDir = path.dirname(bundlePath)
    
    // now we need to convert each file ref to a absolute filepath
    for (fileRef of xml.Workspace.FileRef) {
        
        // get the raw location
        var location = fileRef.$.location
        
        // we currently only support group: locations
        if (location.startsWith("group:")) {
            
            // append it to the workspace dir
            files.push(path.join(bundleDir, location.substring(6, location.length)))
            
        } else {
            
            // warn about the unsupported fileref
            console.warn("[xcworkspace] Warning: Unsupported location on FileRef: ", fileRef)
        }
    }
    
    // return the files 
    return {
        path: bundlePath,
        files: files
    }
}

const path = require('path');
const fs = require('fs');

/// Loads a .xcodeproj file at the specified path
module.exports = function(bundlePath) {
    
    // return the xcodeproj object
    return {
        path: bundlePath,
        sharedSchemes: resolveSchemesInDirectory(path.join(bundlePath, "xcshareddata/xcschemes"))
    }
}

function resolveSchemesInDirectory(dir) {

    // check the directory exists
    if (!fs.existsSync(dir)) {
        return null
    }

    // read the contents of the directory
    var dirContents = fs.readdirSync(dir)
    
    // somewhere to store the schemes
    var schemes = Array()
    
    // enumerate each file
    for (file of dirContents) {
        
        // check that it ends with .xcscheme
        if (path.extname(file) == ".xcscheme") {
            
            // push a dictionary object with all the scheme data we care about
            schemes.push(parseScheme(path.join(dir, file)))
        }
    }
    
    // return the resolved schemes
    return schemes
} 

function parseScheme(schemePath) {
    
    // read the scheme data into a string
    var xmlString = fs.readFileSync(schemePath, 'utf8')
    
    // get the xml parser 
    var parseString = require('xml2js').parseString
    
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
    
    // only parse the bits we want here
    return {
        path: schemePath,
        actions: {
            test: {
                configuration: xml.Scheme.TestAction[0].$.buildConfiguration
            }, 
            archive: {
                configuration: xml.Scheme.ArchiveAction[0].$.buildConfiguration
            }
        }
    }
}

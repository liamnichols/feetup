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
    var files = resolveFilesFromXML(xml, path.dirname(bundlePath))
    var projects = reolveProjectsFromFiles(files) 
    
    // return the files 
    return {
        path: bundlePath,
        files: files,
        projects: projects
    }
}

function resolveFilesFromXML(xml, workspaceDir) {
    
    // somewhere to store the files
    var files = Array()
    
    // now we need to convert each file ref to a absolute filepath
    for (fileRef of xml.Workspace.FileRef) {
        
        // get the raw location
        var location = fileRef.$.location
        
        // we currently only support group: locations
        if (location.startsWith("group:")) {
            
            // resolve path comps
            var filepath = path.join(workspaceDir, location.substring(6, location.length))
            var type = path.extname(filepath)
            
            // strip the . if we have if
            if (type.startsWith(".")) {
                type = type.substring(1, type.length)
            }
            
            // add to the files Array
            files.push({
                path: filepath,
                type: type
            })
            
        } else {
            
            // warn about the unsupported fileref
            console.warn("[xcworkspace] Warning: Unsupported location on FileRef: ", fileRef)
        }
    }
    
    // return the files
    return files
}

function reolveProjectsFromFiles(files) {
    
    // try to load the module
    var xcodeproj = loadXcodeprojModule()
    
    // we couldn't load the module so don't resolve projects
    if (xcodeproj == null) {
        return
    }
    
    // somewhere to hold the projects
    var projects = Array()
    
    // enumerate each file
    for (file of files) {
        
        // check if the file was a project
        if (file.type == "xcodeproj") {
            
            // push the loaded xcodeproj
            projects.push(xcodeproj(file.path))
        }
    }
    
    // return any loaded projects
    return projects
}

function loadXcodeprojModule() {
    
    // we don't want to throw anything as this is only optional
    try {
        
        // return the module, it was fine
        return require("./xcodeproj")
        
    } catch (err) {
        
        // log the error
        console.warn("[xcworkspace] Unable to load xcodeproj module: ", err)
        
        // just return null
        return null
    }
}

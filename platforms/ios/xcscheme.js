const path = require('path');
const fs = require('fs');

/// finds all the schemes within an xcproject bundle.
exports.schemesFromProject = function (dir) {
    
    // get the shared schemes
    var sharedSchemes = resolveSchemesInDirectory(path.join(dir, "xcshareddata/xcschemes"), true)
    
    // get the user data dir
    var userDataDir = path.join(dir, "xcuserdata")
    
    // storage for user schemes
    var userSchemes = Array()
    
    // read the directories in the shared dir
    for (userDir of fs.readdirSync(userDataDir)) {
        
        // check it ends with the correct extension
        if (userDir.endsWith(".xcuserdatad")) {
            
            // get all the schemes within the specific user dir
            var schemes = resolveSchemesInDirectory(path.join(userDataDir, userDir, "xcschemes"), false)
            
            // append them to the user schemes
            userSchemes = userSchemes.concat(schemes)
        }
    }
    
    // return the user and shared schemes
    return sharedSchemes.concat(userSchemes)
}

function resolveSchemesInDirectory(dir, isSharedDir) {

    // check the directory exists, if not return an empty array
    if (!fs.existsSync(dir)) {
        return Array()
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
            schemes.push(parseScheme(path.join(dir, file), isSharedDir))
        }
    }
    
    // return the resolved schemes
    return schemes
} 


function parseScheme(schemePath, shared) {
    
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
        name: path.basename(schemePath, ".xcscheme"),
        shared: shared,
        actions: {
            build: parseBuildActionFromXML(xml.Scheme.BuildAction[0], true),
            run: parseBuildActionFromXML(xml.Scheme.LaunchAction[0], false),
            test: parseBuildActionFromXML(xml.Scheme.TestAction[0], false),
            profile: parseBuildActionFromXML(xml.Scheme.ProfileAction[0], false),
            analyze: parseBuildActionFromXML(xml.Scheme.AnalyzeAction[0], false),
            archive: parseBuildActionFromXML(xml.Scheme.ArchiveAction[0], false)
        }
    }
}

function parseBuildActionFromXML(actionXML, isBuild) {
    
    // the action object
    var action = { }
    
    // check if this is the build action type
    if (isBuild == true) {
        
        // build specific bits
        action.parallelizeBuildables = boolFromXML(actionXML.$.parallelizeBuildables)
        action.buildImplicitDependencies = boolFromXML(actionXML.$.buildImplicitDependencies)
        action.entries = parseBuildActionEntriesFromXML(actionXML.BuildActionEntries)
        
    } else {
        
        // set the configuration, this is consistent across every action apart from build
        action.configuration = actionXML.$.buildConfiguration
    }
    
    // return the action
    return action
}

function parseBuildActionEntriesFromXML(actionEntriesXML) {
    
    // somewhere to store the parsed entries
    var entries = Array()
    
    // enumerate each entry
    for (entryXML of actionEntriesXML[0].BuildActionEntry) {
        
        // get the elements
        var referenceXML = entryXML.BuildableReference[0].$
        var entry = { }
        
        // read the build for flags
        entry.buildsFor = {
            testing: boolFromXML(entryXML.$.buildForTesting),
            running: boolFromXML(entryXML.$.buildForRunning),
            profiling: boolFromXML(entryXML.$.buildForProfiling),
            archiving: boolFromXML(entryXML.$.buildForArchiving),
            analyzing: boolFromXML(entryXML.$.buildForAnalyzing)
        }
        
        // read the target settings
        entry.target = {
            name: referenceXML.BlueprintName,
            identifier: referenceXML.BlueprintIdentifier
        }
        
        // add the entry to the Array
        entries.push(entry)
    }
    
    // return the parsed entries
    return entries
}

function boolFromXML(xmlString) {
    if (xmlString == "YES") {
        return true
    } else if (xmlString == "NO") {
        return false
    } else {
        return null
    }
}

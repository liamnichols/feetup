const child_process = require('child_process')

exports.build = function(workspacePath, schemeName, configuration, derivedDataPath, shouldClean) {
    
    // build the arguments
    var args = [
        "build",
        "-workspace", workspacePath,
        "-scheme", schemeName,
        "-configuration", configuration,
        "-derivedDataPath", derivedDataPath
    ]
    
    // add the optional clear arg
    if (shouldClean) {
        args.splice(0, 0, "clean") // insert it at the font
    }
    
    // execute the command
    xcodebuildWithArgs(args)
}

exports.test = function(workspacePath, schemeName, configuration, derivedDataPath, destinations, shouldClean) {
    
    // build the arguments
    var args = [
        "test",
        "-workspace", workspacePath,
        "-scheme", schemeName,
        "-configuration", configuration,
        "-derivedDataPath", derivedDataPath
    ]
    
    // parse the destination strings
    for (destination of destinations) {
        
        // add each destination
        args.push("-destination")
        args.push(destinationArgFromObject(destination))
    }
    
    // add the optional clear arg
    if (shouldClean) {
        args.splice(0, 0, "clean") // insert it at the font
    }
    
    // execute the command
    xcodebuildWithArgs(args)
}

exports.archive = function(workspacePath, schemeName, configuration, derivedDataPath, archivePath, shouldClean) {
    
    // build the arguments
    var args = [
        "archive",
        "-workspace", workspacePath,
        "-scheme", schemeName,
        "-configuration", configuration,
        "-derivedDataPath", derivedDataPath,
        "-archivePath", archivePath
    ]
    
    // add the optional clear arg
    if (shouldClean) {
        args.splice(0, 0, "clean") // insert it at the font
    }
    
    // execute the command
    xcodebuildWithArgs(args)
}

exports.exportArchive = function(archivePath, exportPath, exportOptionsPlist) {
    
    // build the arguments
    var args = [
        "-exportArchive",
        "-archivePath", archivePath,
        "-exportPath", exportPath,
        "-exportOptionsPlist", exportOptionsPlist,
    ]
    
    // execute the command
    xcodebuildWithArgs(args)
}

exports.getBuildSettings = function(workspacePath, schemeName, configuration) {
    
    // build the arguments
    var args = [
        "-showBuildSettings",
        "-workspace", workspacePath,
        "-scheme", schemeName,
        "-configuration", configuration
    ]
    
    // run the command to get the settings
    var output = child_process.spawnSync("xcodebuild", args)
    
    // check for errors
    if (output.status != 0) {
        
        // throw 
        throw new Error("child_process exited with code '" + output.status + "'. Error:", output.error)
    }
    
    // parse stdout into each individual line
    var lines = String(output.stdout).split("\n")
    
    // somewhere to store our build settings
    var targets = { }
    var currentBuildSettings = { }
    var currentTarget = null
    
    // enumerate the lines to parse the build settings
    for (line of lines) {
        
        // if the line starts with four spaces, it's a setting, otherwise it's the start of a new target
        if (line.startsWith("    ")) {
            
            // parse the build setting
            var pair = getBuildSettingPairFromBuildSettingLine(line)
            
            // check if we got the pair
            if (pair.length == 2) {
                
                // add it to currentBuildSettings
                currentBuildSettings[pair[0]] = pair[1]
            }
            
            
        } else if (line.length != 0) {
            
            // if we had a current target, add the currentBuildSettings
            if (currentTarget != null) {
                
                // add the currentBuildSettings to the targets dict under the currentTarget key
                targets[currentTarget] = currentBuildSettings
            }
            
            // clear the currentValues
            currentBuildSettings = { }
            currentTarget = null
            
            // work out the new target
            currentTarget = getTargetNameFromBuildSettingLine(line)
        }
    }
    
    // add the last lot of settings if needed
    if (currentTarget != null) {
        targets[currentTarget] = currentBuildSettings
    }
    
    // return the targets
    return targets
}

/// Exectues the xcodebuild command with the specified arguments
function xcodebuildWithArgs(args) {
    
    // log it
    console.log("[xcodebuild] Executing Command:")
    console.log(args.join(" "))
    
    // run it 
    var output = child_process.spawnSync("xcodebuild", args, {
        stdio: [ 0, 1, 2 ]
    })
    
    // log
    console.log("[xcodebuild] Finished with status:", output.status)
    console.log("[xcodebuild] Finished with error:", output.error)
    
    // check for errors
    if (output.status != 0) {
        
        // throw 
        throw new Error("child_process exited with code '" + output.status + "'. Error:", output.error)
    }
}

function getBuildSettingPairFromBuildSettingLine(line) {
    
    // trim whitespace and split on " = "
    return line.trim().split(" = ")
}

function getTargetNameFromBuildSettingLine(line) {
    
    // examples:
    //  'Build settings for action build and target Jenkins:'
    //  'Build settings for action build and target "Jenkins Space":'
    
    // return null as there is nothing to parse
    if (line.length == 0) {
        return null
    }
    
    // check if we're looking for a build setting with spaces or not
    if (line.indexOf('"') != -1) {
        
        // split on " and return the middle item
        var split = line.split('"')
        
        // return the middle name
        return split[1]
        
    } else {
        
        // it's the last word, split on space
        var words = line.split(" ")
        
        // get the last word
        var targetName = words[words.length - 1]
        
        // trim the : if it's there
        if (targetName.indexOf(":") != -1) {
            
            // trim it
            return targetName.substring(0, targetName.length - 1)
            
        } else {

            // just return the target name
            return targetName
        }
    }
}

/// Helper for test destinations
function destinationArgFromObject(obj) {
    
    // build a platform string to be passed into the cli
    return "platform=" + obj.platform + ",name=" + obj.name + ",OS=" + obj.version
}

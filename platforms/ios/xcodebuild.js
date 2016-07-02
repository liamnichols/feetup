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

/// Exectues the xcodebuild command with the specified arguments
function xcodebuildWithArgs(args) {
    
    // log it
    console.log("[xcodebuild] Executing Command:")
    console.log(args.join(" "))
    
    // run it 
    child_process.spawnSync("xcodebuild", args, {
        stdio: [ 0, 1, 2 ]
    })
}

/// Helper for test destinations
function destinationArgFromObject(obj) {
    
    // build a platform string to be passed into the cli
    return "platform=" + obj.platform + ",name=" + obj.name + ",OS=" + obj.version
}

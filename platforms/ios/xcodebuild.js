const child_process = require('child_process');

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
    
    console.log("xcodebuild test")
}

exports.archive = function(workspacePath, schemeName, configuration, derivedDataPath, archivePath, shouldClean) {
    
    console.log("xcodebuild archive")
}

exports.exportArchive = function(archivePath, exportPath, exportOptions) {
    
    console.log("xcodebuild -exportArchive")
}

function xcodebuildWithArgs(args) {
    
    // log it
    console.log("[xcodebuild] Executing Command:")
    console.log(args.join(" "))
    
    // run it 
    child_process.spawnSync("xcodebuild", args, {
        stdio: [ 0, 1, 2 ]
    })
}

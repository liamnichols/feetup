const plist = require("plist")
const fs = require("fs")
const temp = require("temp").track()
const xcodebuild = require("./xcodebuild")
const child_process = require('child_process')
const path = require('path');

exports.exportIPA = function(fromArchive, toDirectory, exportOptions) {
    
    // generate the exportOptionsPlist
    var tempFile = temp.openSync({
        suffix: ".plist"
    })
    
    // create the plist
    var builtPlist = plist.build(exportOptions)
    
    // write the plist
    fs.writeSync(tempFile.fd, builtPlist)
    
    // build the archive
    xcodebuild.exportArchive(fromArchive, toDirectory, tempFile.path)
}

exports.exportSymbols = function(fromArchive, toFile) {
    
    // work out the arguments for the zip command
    var args = [
        "-r",
        toFile,
        "dSYMs/"
    ]
    
    // execute the zip command
    child_process.spawnSync("zip", args, {
        stdio: [ 0, 1, 2 ],
        cwd: fromArchive
    })
}

exports.optimizeArchive = function(archive) {
    
    // get the name
    var name = path.basename(archive)
    
    // work out the arguments for the zip command
    var args = [
        "-r",
        name + ".zip",
        name 
    ]
    
    // execute the zip command
    child_process.spawnSync("zip", args, {
        stdio: [ 0, 1, 2 ],
        cwd: path.dirname(archive)
    })
    
    // delete the original .xcarchive
    child_process.spawnSync("rm", [ "-rf", archive ], {
        stdio: [ 0, 1, 2 ],
    })
}

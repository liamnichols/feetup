const plist = require("plist")
const fs = require("fs")
const fsExtra = require('fs-extra')
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
    spawnSyncAndThrow("zip", args, {
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
    spawnSyncAndThrow("zip", args, {
        stdio: [ 0, 1, 2 ],
        cwd: path.dirname(archive)
    })
    
    
    // delete the original .xcarchive
    spawnSyncAndThrow("rm", [ "-rf", archive ], {
        stdio: [ 0, 1, 2 ],
    })
}

exports.writeProjfileToDir = function(projfile, dir) {
    
    // check the dir exists
    if (!fs.existsSync(dir)) {
        
        // create it if not
        spawnSyncAndThrow("mkdir", [ "-p", dir ], {
            stdio: [ 0, 1, 2 ]
        })
    }    
    
    // parse the projfile back to json
    var json = JSON.stringify(projfile, null, 4)
    
    // write the json to file
    fs.writeFileSync(path.join(dir, "Projfile"), json)
}

exports.exportAllArtifacts = function(fromDir, toDir) {
    
    // just pass into fs-extra 
    fsExtra.copySync(fromDir, toDir, {
        clobber: true
    })
}

function spawnSyncAndThrow(cmd, args, opts) {
    
    // run the command
    var output = child_process.spawnSync(cmd, args, opts)
    
    // check for errors
    if (output.status != 0) {
        
        // throw 
        throw new Error("child_process exited with code '" + output.status + "'. Error:", output.error)
    }
}

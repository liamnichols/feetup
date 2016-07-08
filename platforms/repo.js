const child_process = require("child_process")
const fs = require("fs")
const path = require("path")

exports.reset = function(dir) {
    
    console.log("[repo] Resetting", dir)
    
    // reset the repo
    spawnSyncAndThrow("git", [ "reset", "--hard" ], {
        stdio: [ 0, 1, 2 ],
        cwd: dir
    })
    
    // clean everything apart from the build dir
    spawnSyncAndThrow("git", [ "clean", "-fdx", "-e", "build/" ], {
        stdio: [ 0, 1, 2 ],
        cwd: dir
    })
}

exports.archive = function(dir, toFile) {
    
    console.log("[repo] Archiving", dir)
    
    // work out the toDir to check it exists
    var toDir = path.dirname(toFile)
    
    // check it
    if (!fs.existsSync(toDir)) {
        
        // create it
        spawnSyncAndThrow("mkdir", [ "-p", toDir ], {
            stdio: [ 0, 1, 2 ]
        })
    }    
    
    // zip the repo
    spawnSyncAndThrow("zip", [ "-r", toFile, ".", "-x", "*.git*" ], {
        stdio: [ 0, 1, 2 ],
        cwd: dir
    })
}

function spawnSyncAndThrow(cmd, args, opts) {
    
    // run the command
    var output = child_process.spawnSync(cmd, args, opts)
    
    // check for errors
    if (output.status != 1) {
        
        // throw 
        throw new Error("child_process exited with code '" + output.status + "'. Error:", output.error)
    }
}

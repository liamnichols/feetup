const child_process = require("child_process")
const fs = require("fs")
const path = require("path")

exports.reset = function(dir) {
    
    console.log("[repo] Resetting", dir)
    
    // reset the repo
    child_process.spawnSync("git", [ "reset", "--hard" ], {
        stdio: [ 0, 1, 2 ],
        cwd: dir
    })
    
    // clean everything apart from the build dir
    child_process.spawnSync("git", [ "clean", "-fdx", "-e", "build/" ], {
        stdio: [ 0, 1, 2 ],
        cwd: dir
    })
}

exports.archive = function(dir, toFile) {
    
    console.log("[repo] Archiving", dir)
    
    // work out the toDir to check it exists
    var toDir = path.dirname(toFile)
    
    console.log("mkdir", toDir)
    
    // check it
    if (!fs.existsSync(toDir)) {
        
        // create it
        child_process.spawnSync("mkdir", [ "-p", toDir ], {
            stdio: [ 0, 1, 2 ]
        })
    }    
    
    // zip the repo
    child_process.spawnSync("zip", [ "-r", toFile, ".", "-x", "*.git*" ], {
        stdio: [ 0, 1, 2 ],
        cwd: dir
    })
}

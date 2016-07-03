const child_process = require("child_process")

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

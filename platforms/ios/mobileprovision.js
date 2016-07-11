const child_process = require("child_process")
const plist = require("plist")

module.exports = function(filepath) {

    // decode to plist
    var plistData = decodeFile(filepath)
    
    // read the plist and store the data
    this.data = plist.parse(plistData)
    
    // store the path
    this.path = filepath
}

function decodeFile(filepath) {
    
    // build the arguments
    var args = [
        "cms",
        "-D",
        "-i", filepath,
    ]
    
    // run the command to get the settings
    var output = child_process.spawnSync("security", args)
    
    // check for errors
    if (output.status != 0) {
        
        // throw 
        throw new Error("child_process exited with code '" + output.status + "'. Error:", output.error)
    }
    
    // return stdout as this is where the xml goes
    return String(output.stdout)
}

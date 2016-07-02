const plist = require("plist")
const fs = require("fs")
const temp = require("temp")

exports.create = function(options) {

    // create a plist from options
    var plistData = plist.build(options)
    
    // get a temp file to write to
    var plistFile = temp.path({
        suffix: '.plist'
    })
    
    // write it
    fs.writeFileSync(plistFile, plistData)
    
    // reutrn the temp path to cleanup later
    return plistFile
}

exports.cleanup = function(path) {
    
    // if the file exists
    if (fs.existsSync(path)) {
        
        // delete it
        fs.unlinkSync(path)
    }
}

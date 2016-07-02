const plist = require("plist")
const fs = require("fs")
const temp = require("temp").track()
const xcodebuild = require("./xcodebuild")

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

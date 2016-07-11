const path = require("path")
const fs = require("fs")
const fsExtra = require("fs-extra")
const ProvisioningProfile = require("./mobileprovision")

/// Imports signing assets from the specified directory
exports.import = function(dir) {
    
    // check we have access to this directory
    try {
        
        // try to access the dir
        fs.accessSync(dir)
        
    } catch (err) {
        
        // just log a message and return
        console.warn("[signing] Not importing signing assets as we cannot access the directory:", err.message)
        return
    }
    
    // read the contents
    for (file of fs.readdirSync(dir)) {
        
        // we want to import either mobileprovision files or p12's
        if (path.extname(file) == ".mobileprovision") {
            
            // copy the provisioning profile into the directory
            importProvisioningProfile(path.join(dir, file))
            
        } else if (path.extname(file) == ".p12") {
            
            // import the .p12 into the keychain
            importCertificates(path.join(dir, file))
        }
    }
}

function importProvisioningProfile(filepath) {

    // decode and read the profile
    var profile = new ProvisioningProfile(filepath)
    
    // get it's uuid
    var uuid = profile.data.UUID
    
    // work out the target path
    var targetProfilePath = path.join(process.env.HOME, "Library/MobileDevice/Provisioning Profiles", uuid) + ".mobileprovision"
    
    // check if a profile with the UUID already exists.
    if (!fs.existsSync(targetProfilePath)) {
        
        // copy the profile
        console.log("[signing] Importing provisioning profile:", uuid)
        fsExtra.copySync(filepath, targetProfilePath)
        
    } else {
        
        // just log that it's alredy imported
        console.log("[signing] Profile already exists. Skipping (" + uuid + ")")
    }
}

function importCertificates(filepath) {
    
}

const fs = require("fs")
const path = require("path")
const child_process = require("child_process")

// Uses flow based on http://www.kylethielk.com/blog/build-ios-app-with-jenkins-code-signing-issues/

// Read the default keychain path when the module is first required so we cna revert whenever we need to
var defaultKeychainPath = getDefaultKeychainPath()

/// Create a new keychain instance at the specified path (if it doens't exist) or load an existing one
module.exports = function(filepath) {
        
    /// The filepath of this keychain
    this.path = filepath
    
    /// Returns true or false based on if the keychain file already exists
    this.exists = function() {
        
        // just check that the file eixsts
        return checkAccess(filepath)
    }
    
    /// deletes a keychain at this path
    this.delete = function() {
        
        // assert that it exists
        assertAccess(filepath)
        
        // run the delete command
        spawnSyncAndThrow("security", [ "delete-keychain", filepath ])
        
        // log a msg
        console.log("[keychain] Deleted keychain at path:", filepath)
    }
    
    /// Creates the keychain at the specified path
    this.create = function(password) {
    
        // make sure the password is a string
        if (typeof password != "string") {
            throw new Error("Must specify a password when creating a keychain")
        }
        
        // run the security command, throws if it fails
        spawnSyncAndThrow("security", [ "create-keychain", "-p", password, filepath ])
        
        // log a msg
        console.log("[keychain] Created keychain at path:", filepath)
    }
    
    this.unlock = function(password) {
        
        // make sure the password is a string
        if (typeof password != "string") {
            throw new Error("Must specify a password when creating a keychain")
        }
        
        // run the security command to unlock
        spawnSyncAndThrow("security", [ "unlock-keychain", "-p", password, filepath ])
        
        // log a message
        console.log("[keychain] Unlocked keychain at path:", filepath)
    }
    
    /// Imports the file at the specified path into the keychain
    this.import = function(toImport, password) {
        
        // assert that the file exists
        assertAccess(toImport)
        
        // make sure the password is a string
        if (typeof password != "string") {
            throw new Error("Must specify a password when creating a keychain")
        }
        
        // run the import command
        spawnSyncAndThrow("security", [ "import", toImport, "-k", filepath, "-P", password, "-A" ])
        
        // log it
        console.log("[keychain] Imported", path.basename(toImport), "into keychain:", filepath)
    }
    
    /// Makes this keychain the default
    this.makeDefault = function() {
        makeKeychainDefault(filepath)
    }
    
    /// Resets the the default keychain at the point of requiring this module.
    this.resetDefault = function() {
        makeKeychainDefault(defaultKeychainPath)
    }
}

/// returns false if we can't access filepath
function checkAccess(filepath) {
    
    try {
        
        // try to access the filepath
        assertAccess(filepath)
        
        // return true as we can access it
        return true
        
    } catch (err) {
        
        // just return false if we can't access it
        return false
    }
}

/// throws if we cannot access filepath
function assertAccess(filepath) {

    // just run the access command
    fs.accessSync(filepath)
}

function makeKeychainDefault(filepath) {
    
    // assert that the keychain exists
    assertAccess(filepath)
    
    // make sure the old default keychain is added to the scope and set it back to default.
    spawnSyncAndThrow("security", [ "list-keychain", "-s", filepath ])
    spawnSyncAndThrow("security", [ "default-keychain", "-s", filepath ])
    
    console.log("[keychain] Updated default keychain:", filepath)
}

function getDefaultKeychainPath() {
    
    // read the default keychain from the security command
    var output = spawnSyncAndReturnOutput("security", [ "default-keychain" ])
    
    // parse it, (it's in between quotes)
    return output.match(/"([^"]+)"/)[1]
}

function spawnSyncAndThrow(cmd, args, opts) {
    
    // run the command to get the settings
    var output = child_process.spawnSync(cmd, args, opts)
    
    // check for errors
    if (output.status != 0) {
        
        // throw 
        throw new Error("child_process exited with code '" + output.status + "'. Error:", output.error)
    }
    
    // return the output
    return output
}

function spawnSyncAndReturnOutput(cmd, args, opts) {
    
    // spawn the cmd and throw if it failed
    var output = spawnSyncAndThrow(cmd, args, opts)
    
    // return the output buffer as a string
    return String(output.stdout)
}

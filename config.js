
// Sample Structure

// {
//     "_comment": "Root directory used for exported products.",
//     "exportDirectory": "/Path/To/Exports/Directory",
//     
//     "_comment": "Path to the keychain file used by feetup during build processes.",
//     "keychainPath": "/Path/To/store.keychain"
// }

const path = require('path');

/// Reads a config.json file from the specified path
module.exports = function(filepath) {
    
    // read the file
    var fs = require('fs')
    var file = fs.readFileSync(filepath, 'utf8')
    
    // parse the json
    var json = JSON.parse(file)
    
    // TODO: validate for required parameters
    
    // return the json
    return json
}

const path = require('path');

/// Reads a project.json file from within the specified directory and returns it
module.exports = function(workspace) {
    
    // get the absolute path to the json file
    var filepath = path.join(workspace, 'Projfile')
    
    // read the file
    var fs = require('fs')
    var file = fs.readFileSync(filepath, 'utf8')
    
    // parse the json
    var json = JSON.parse(file)
    
    // return the json
    return json
}

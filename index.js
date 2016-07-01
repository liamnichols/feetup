#! /usr/bin/env node

// parse the arguments
var argv = require('minimist')(process.argv.slice(2))

// work through the supported commands
if (argv._[0] == "build") 
{
    // we want to build, get the module
    var build = require("./build")
    
    // make sure the required parameters have been provided
    checkRequired(argv, ['platform', 'workspace'])
    
    // get the parameters
    var platform = argv["platform"]
    var workspace = argv["workspace"]
    
    // build
    build(workspace, platform)
}
else
{
    // the command isn't supported, throw an error
    throw new Error("Unknown Command '" + argv._[0] + "'")
}

/// Checks for null parameters in argv and throws if any are missing.
function checkRequired(argv, required) {
    
    // enumerate each required parameter
    for (var idx in required) 
    {
        // get the parameter from the array
        var parameter = required[idx]
        
        // if it's null in the args
        if (argv[parameter] == null) 
        {
            // throw an error
            throw new Error("Missing parameter '" + parameter + "'")
        }
    }
}

#! /usr/bin/env node

// parse the arguments
var argv = require('minimist')(process.argv.slice(2))

// work through the supported commands
if (argv._[0] == "build") 
{
    // we want to build, get the module
    var build = require("./build")
    
    // get the parameters
    var platform = argv["platform"]
    var workspace = argv["workspace"]
    
    // build
    build(workspace, platform)
}
else
{
    // the command isn't supported, just log that.
    console.log("Unknown Command '" + argv._[0] + "'")
}

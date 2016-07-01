#! /usr/bin/env node

// parse the arguments
var argv = require('minimist')(process.argv.slice(2));

// work through the supported commands
if (argv._[0] == "build") 
{
    // we want to build.
    
}
else
{
    // the command isn't supported, just log that.
    console.log("Unknown Command '" + argv._[0] + "'");
}

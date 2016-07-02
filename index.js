#! /usr/bin/env node

const ERR_USAGE = 4001
const ERR_PROJFILE = 4002

// parse the arguments
var argv = require('minimist')(process.argv.slice(2), {
    string: [ "workspace", "platform" ],
    boolean: [ "nightly", "help" ],
    default: {
        "nightly": false,
        "help": false,
        "platform": "ios"
    }
})

// check and print help if it was requested
if (argv.help == true) {
    printUsage()
    return
}

// flags on what we should be doing
var shouldArchive = false
var shouldTest = false
var workspace = argv.workspace
var nightly = argv.nightly
var platform = argv.platform

// work out what actions we want to perform based on input args
if (argv._.indexOf("test") != -1) {
    shouldTest = true
} 
if (argv._.indexOf("archive") != -1) {
    shouldArchive = true
}

// validate usage
try {
    
    // check that we have specified some actions
    if (!shouldTest && !shouldArchive)  {
        throw new Error("You must specify at least one action [test|archive]")
    }

    // verify the workspace is set
    if (workspace == null || workspace.length == 0) {
        throw new Error("You must specify the '--workspace' flag")
    }
    
} catch (err) {
    
    // print usage
    printUsage(err)
    process.exit(ERR_USAGE)
}

// log what is happening
console.log("")
console.log("Actions:") 
if (shouldTest) { console.log("  test") }
if (shouldArchive) { console.log("  archive") }
console.log("")
console.log("Options:")
console.log("  nightly: " + nightly)
console.log("  workspace: " + workspace)
console.log("  platform: " + platform)
console.log("")

// read the profjile
var projfile
try {
    
    // load the projfile
    projfile = require("./projfile")(workspace)
    
} catch (err) {
    
    // log the message
    console.error("Unable to read Projfile from workspace")
    console.error(err.message);
    process.exit(ERR_PROJFILE)
}









/// Print the usage with an optional error
function printUsage(err) {
    
    // start with some whitespace
    console.log("")
    
    // print the error if there was one
    if (err != null) {
        console.log("Error:")
        console.log("  " + err.message)
        console.log("")
    } 
    
    // print the usage
    console.log("Usage:")
    console.log("  feetup [test|archive] --workspace <workspacePath> --nightly")
    console.log("")
    console.log("  Actions:")
    console.log("    test       Will verify that builds defined in the workspace compile and also execute any defined tests")
    console.log("    archive    Will archive and export any builds defined in the workspace")
    console.log("")
    console.log("  Options:")
    console.log("    --workspace    Required. The directory containing the Projfile")
    console.log("    --nightly      Optional. When specified, the archive action will work with the special nightly build configuration defined in the Projfile")
    console.log("")
}

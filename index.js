#! /usr/bin/env node

// parse the arguments
var argv = require('minimist')(process.argv.slice(2), {
    string: [ "workspace" ],
    boolean: [ "nightly" ],
    default: {
        "nightly": false
    }
})

// flags on what we should be doing
var shouldArchive = false
var shouldTest = false
var workspace = argv["workspace"]
var nightly = argv["nightly"]

// work out what actions we want to perform based on input args
if (argv._.indexOf("test") != -1) {
    shouldTest = true
} else if (argv._.indexOf("archive") != -1) {
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
    
} catch (e) {
    
    // print usage
    printUsage(e)
    return
}

// log what is happening
console.log("")
console.log("Actions:") 
console.log("  shouldTest: " + shouldTest)
console.log("  shouldArchive: " + shouldArchive)
console.log("")
console.log("Flags")
console.log("  nightly: " + nightly)
console.log("  workspace: " + workspace)
console.log("")

// 





/// Print the usage with an optional error
function printUsage(error) {
    
    // start with some whitespace
    console.log("")
    
    // print the error if there was one
    if (error != null) {
        console.log("Error:")
        console.log("  " + error.message)
        console.log("")
    } 
    
    // print the usage
    console.log("Usage:")
    console.log("  feetup [test|archive] --workspace <workspacePath> --nightly")
    console.log("")
}

#! /usr/bin/env node

const path = require("path")

const ERR_USAGE = 4001
const ERR_PROJFILE = 4002
const ERR_LOAD_PLATFORM = 4003
const ERR_LOAD_CONFIG = 4004

// parse the arguments
var argv = require('minimist')(process.argv.slice(2), {
    string: [ "workspace", "platform", "configPath" ],
    boolean: [ "nightly", "help" ],
    default: {
        "nightly": false,
        "help": false,
        "platform": "ios",
        "configPath": process.env.HOME + "/.feetup/config.json"
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
var buildNumber = parseInt(argv.buildNumber)
var jobName = argv.jobName
var configPath = argv.configPath

// work out what actions we want to perform based on input args
if (argv._.indexOf("test") != -1) {
    shouldTest = true
} 
if (argv._.indexOf("archive") != -1) {
    shouldArchive = true
}

// cleanse build number
if (buildNumber <= 0 || isNaN(buildNumber)) {
    buildNumber = null
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
console.log("  configPath: " + configPath)
console.log("  nightly: " + nightly)
console.log("  workspace: " + workspace)
console.log("  platform: " + platform)
console.log("  buildNumber: " + buildNumber)
console.log("  jobName: " + jobName)

// read the default config
var config
try {
    
    // load the config
    config = require("./config")(configPath)
    
} catch (err) {
    
    // log the message
    console.error("Unable to read config.json at", configPath)
    console.error(err.message);
    process.exit(ERR_LOAD_CONFIG)
}

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

// load the platform and validate
var platformModule
var platformData 
try {
    
    // try to load the module
    platformModule = require("./platforms/" + platform)
    
    // validate the loaded module
    platformData =  platformModule.load(projfile, workspace)
    
} catch (err) {
    
    // log and exit
    console.error("Unable to load valid platform: " + platform)
    console.error(err.message);
    process.exit(ERR_LOAD_PLATFORM)
}

// TODO: work out the output directory for built products and pass it in the options

// TODO: any generic pre-build actions should go here

// execute tasks or the specific platform
platformModule.execute(projfile, platformData, workspace, {
    config: config,
    nightly: nightly,
    buildNumber: buildNumber,
    jobName: jobName,
    exportPathForCurrentTask: getExportPath(config.exportDirectory, jobName, nightly, buildNumber),
    actions: {
        test: shouldTest,
        archive: shouldArchive
    },
})

// TODO: we want to perform post build actions here







function getExportPath(baseDir, jobName, nightly, buildNumber) {

    // check we have the job name and baseDir
    if (baseDir == null) {
        throw new Error("Unable to create an export path for archive task as no exportDirectory has been specified in config.json")
    }
    
    if (jobName == null) {
        throw new Error("Unable to create export path for archive task as no jobName has been specified in the arguments")
    }

    // if we have a nightly build then the location is based on date and not buildNumber
    if (nightly) {
        
        // work out the current date
        var date = new Date()
        var dateString = date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear()
        
        // return baseDir/jobName/nightly/date
        return path.join(baseDir, jobName, "nightly", dateString)
        
    } else {
        
        // check the build number
        if (buildNumber == null) {
            throw new Error("Unable to create export path for archive task as no buildNumber has been speicified in the arguments")
        }
        
        // return baseDir/jobName/releases/buildNumber
        return path.join(baseDir, jobName, "releases", String(buildNumber))
    }
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
    console.log("    --workspace        Required. The directory containing the Projfile")
    console.log("    --nightly          Optional. When specified, the archive action will work with the special nightly build configuration defined in the Projfile")
    console.log("    --buildNumber      Optional. A custom build number to set when archiving the project. Required when archive has been specified and --nightly hasn't")
    console.log("    --jobName          Optional. The job name used when exporting artifacts. Required if 'archive' action is specified")
    console.log("    --configPath       Optional. The path to the configuration file used for additional settings if in a custom location. Default location is ~/.feetup/config.json")
    console.log("")
}

const path = require('path');
const xcodebuild = require("./xcodebuild")
const exporting = require("./exporting")
const modifying = require("./modifying")
const XcodeWorkspace = require("./xcworkspace")
const repo = require("../repo")
const signing = require("./signing")
const Keychain = require("./keychain")
const randomstring = require("randomstring")

/// Reads the decoded Projfile data, validate and returns any relevant data for the actions
exports.load = function(projfile, dir) {
    
    // ensure the ios platform is defined in the Projfile
    if (projfile.platforms.ios == null) {
        throw new Error("Platform 'ios' is not defined in Projfile")
    } 
    
    // resolve the .xcworkspace file defined in the project
    var workspace = new XcodeWorkspace(path.join(dir, projfile.platforms.ios.workspace))
    
    // return the loaded info
    return {
        workspace: workspace,
        derivedDataPath: path.join(dir, "DerivedData"),
        exportsPath: path.join(dir, "build/feetup/exports")
    }
}

/// Executes tasks for this platform
exports.execute = function (projfile, data, dir, opts) {
    
    // to save us reading the whole projfile each time
    var ios = projfile.platforms.ios
    
    // setup the keychain
    var keychainPassword = randomstring.generate()
    var keychain = setupNewKeychain(keychainPassword)
    
    // wrap EVERYTHING from here into a try block as we need to reset the keychain after
    var caughtError = null
    try {
        
        console.log("[ios] building")
        
        // unlock the keychain
        keychain.unlock(keychainPassword)
        
        // import signing assets as required
        signing.import(path.join(dir, "Signing"), keychain)
        
        // TODO: Select the correct version of xcode. 
        
        // if we're archiving, first thing we do is zip up the entire repo.
        if (opts.actions.archive == true) {
            
            // zip up the repo
            repo.archive(dir, path.join(data.exportsPath, "source.zip"))
        }
        
        // if we want to test
        if (opts.actions.test == true) {
            
            // make sure there are test schemes defined in the Projfile as we require at least one
            if (ios.tests.schemes.count == 0) {
                throw new Error("Attempting to run test action but Projfile doesn't specify any test schemes to run.")
            }
            
            // enumerate each scheme as we are about to test it
            for (schemeName of ios.tests.schemes) {
                
                // find the scheme
                var scheme = findScheme(schemeName, data.workspace)
            
                // get the variables we need
                var workspacePath = data.workspace.path
                var schemeName = scheme.name
                var configuration = scheme.actions.test.configuration
                var derivedDataPath = data.derivedDataPath
                
                // now we wnat to test or build this scheme
                if (ios.tests.dryRun == true) {
                    
                    // use the build command
                    xcodebuild.build(workspacePath, schemeName, configuration, derivedDataPath, true)
                    
                } else {
                    
                    // read the destinations
                    var destinations = null // TODO: read these into whatever we pass into xcodebuild
                    
                    // use the test command
                    xcodebuild.test(workspacePath, schemeName, configuration, derivedDataPath, destinations)
                }
            }
        }
        
        // check if we also want to perform an acrhive 
        if (opts.actions.archive == true) {
            
            // validate the config.exportDirectory
            if (opts.config.exportDirectory == null) {
                throw new Error("Attempting archive task without the exportDirectory being specified in the feetup config.json file.")
            } 
            
            // validate that we have a job name
            if (opts.jobName == null) {
                throw new Error("Attempting archive task without the jobName parameter specified")
            }
            
            // read the archives from the projfile
            var archives = archivesFromProjfile(projfile, opts)
            
            // make sure we actually have some
            if (archives.count == 0) {
                throw new Error("Attempting to run action action but Projfile doesn't specify any archives to run for this configuration.")
            }
            
            // enumerate each archive to perform the actions
            for (archive of archives) {
                
                // find the scheme
                var res = findSchemeAndProject(archive.scheme, data.workspace)
                var scheme = res[0]
                var project = res[1]
                
                // get any variables we need
                var workspacePath = data.workspace.path
                var schemeName = scheme.name
                var configuration = scheme.actions.test.configuration
                var derivedDataPath = data.derivedDataPath
                var exportsPath = data.exportsPath
                var archivePath = path.join(exportsPath, schemeName, schemeName + ".xcarchive")
                var ipaPath = path.join(exportsPath, schemeName)
                var dSYMsPath = path.join(exportsPath, schemeName, schemeName + ".dsym.zip")
                var buildSettings = xcodebuild.getBuildSettings(workspacePath, schemeName, configuration)
                var targets = project.getBuildTargetsForScheme(scheme, "archiving")
                
                // reset the git repo
                repo.reset(dir)
                    
                // check if we've passed in a build number
                if (opts.buildNumber > 0) {
                    
                    // set the build number in the info.plist 
                    modifying.setBuildNumber(opts.buildNumber, dir, buildSettings, targets)
                }
                
                // tag an icon if needed
                modifying.tagAppIconInProject(project, buildSettings, targets)
                
                // archive the project
                xcodebuild.archive(workspacePath, schemeName, configuration, derivedDataPath, archivePath, true)
                
                // export the ipa archive
                exporting.exportIPA(archivePath, ipaPath, exportOptionsForArchive(archive))
                
                // extract the symbols
                exporting.exportSymbols(archivePath, dSYMsPath)
                
                // optimize the archive (compress and delete)
                exporting.optimizeArchive(archivePath)
                
                // TODO: process the ipa (extract info.plist, icon etc)
            }
            
            // write projfile out to exports for reference later
            exporting.writeProjfileToDir(projfile, data.exportsPath)
            
            // TODO: attempt hockey upload here?
            
            // export built products into the global export directory
            exporting.exportAllArtifacts(data.exportsPath, path.join(opts.config.exportDirectory, opts.jobName, String(opts.buildNumber)))
        }
        
    } catch (err) {
        
        // don't throw the error just yet.
        caughtError = err
        
        // log a warning in the console
        console.warn("[ios] Caught error but not throwing until the keychain has been reset.")
    }
    
    // reset to the default keychain and delete it
    cleanupKeychain(keychain)
    
    // if there was an error, throw it
    if (caughtError != null) {
        console.warn("[ios] Throwing caught error now.")
        throw caughtError
    }
}

function cleanupKeychain(keychain) {

    // reset to the default keychain
    keychain.resetDefault()

    // check if the keychain exists
    if (keychain.exists()) {
        
        // delete it if it exists
        keychain.delete()
    }
}

function setupNewKeychain(password) {
    
    // create a new keychain instance in our ios keychain path
    var keychain = new Keychain(path.join(process.env.HOME, "/.feetup/ios.keychain"))
    
    // check if the keychain exists
    if (keychain.exists()) {
        
        // delete it if it exists
        keychain.delete()
    }
    
    // create the new keychain 
    keychain.create(password)
    
    // make it the default
    keychain.makeDefault()
    
    // return the new keychain
    return keychain
}

function findScheme(name, workspace) {
    
    return findSchemeAndProject(name, workspace)[0]
}

function findSchemeAndProject(name, workspace) {
    
    // enumerate each project
    for (project of workspace.projects) {
        
        // get the scheme
        var scheme = project.schemeWithName(name) 
        
        // check if we found it
        if (scheme != null) {
        
            // reutrn the scheme
            return [scheme, project]
        }
    }
    
    // throw an error as we couldn't find the scheme
    throw new Error("Unable to find scheme named '" + name + "'. Is it shared in the .xcodeproj?")
}

function archivesFromProjfile(projfile, opts) {
    
    // somewhere to store them
    var archives = Array()
    
    // enumerate each archive
    for (archive of projfile.platforms.ios.archives) {
        
        // filter against nightly
        if (opts.nightly == (archive.nightly == true)) {
            
            // add to the return Array
            archives.push(archive)
        }
    }
    
    // return the archives
    return archives
}

function exportOptionsForArchive(archive) {
    
    // check for the export options
    if (archive.exportoptions != null) {
        
        // return the user defined options
        return exportoptions
        
    } else {
        
        // return the default options
        return {
            method: "same-as-archive"
        }
    }
}

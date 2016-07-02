const child_process = require('child_process')
const path = require('path')

exports.readRootObject = function(dir) {

    // just load from file and parse the root object
    return getRootObject(loadFromFile(path.join(dir, "project.pbxproj")))
}

function getRootObject(pbxproj) {
    
    // parse the object with the root id
    return parseObject(pbxproj.objects[pbxproj.rootObject], pbxproj)
}


/// Parsing

var isaParsingLookup = {
    "PBXProject": parsePBXProject,
    "PBXNativeTarget": parsePBXNativeTarget
}

function parseObject(raw, pbxproj) {
    
    // look up it's isa and parse it 
    var parser = parserForISA(raw.isa)
    
    // pass the raw into the parser and return it's value
    return parser(raw, pbxproj)
}

function parserForISA(isa) {
    
    // check the lookup
    return isaParsingLookup[isa]
}

function parsePBXProject(raw, pbxproj) {
    
    // target parsing
    var targets = raw.targets.map(function(id) {
        return parseObject(pbxproj.objects[id], pbxproj)
    })
    
    // just return some basics
    return {
        targets: targets,
        mainGroup: raw.mainGroup
    }
}

function parsePBXNativeTarget(raw) {
    
    return {
        name: raw.name,
        productName: raw.productName,
        productType: raw.productType
    }
}


/// Loading

function loadFromFile(filepath) {
    
    // get the args for plutil
    var args = [
        "-convert",
        "json",
        "-o",
        "-",
        filepath
    ]
    
    // run the command to get the settings
    var output = child_process.spawnSync("plutil", args)
    
    // parse the json
    return JSON.parse(output.stdout)
}

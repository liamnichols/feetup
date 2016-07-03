const child_process = require('child_process')
const path = require('path')

function GroupHelper(projectDir) {

    var parentLookup = { }
    var itemCache = { }
    var mainGroupId = null
    
    this.isMainGroup = function(item) {
        
        // compare the main group id
        return item.id == mainGroupId
    }
    
    this.setMainGroup = function(item) {
        
        // set the mainGroupId
        mainGroupId = item.id
        
        // cache the item
        itemCache[item.id] = item
    }
    
    this.trackItemWithParentId = function(item, parentId) {
        
        // map the parent
        parentLookup[item.id] = parentId
        
        // cache the item
        itemCache[item.id] = item
    }
    
    this.getItem = function(itemId) {
        
        // return what we can from the cache
        return itemCache[itemId]
    }
    
    this.getParent = function(item) {
        
        // make sure it's not the main group
        if (this.isMainGroup(item)) {
            
            // return null if it is
            return null
            
        } else {
            
            // otherwise return the item from the cache based on the parent lookup
            return itemCache[parentLookup[item.id]]
        }
    }
    
    this.resolveDisplayName = function(item) {
        
        if (item.name != null) {
            return item.name
        } else if (item.path != null) {
            return path.basename(item.path)
        } else if (this.isMainGroup(item)) {
            return "Main Group"
        } else {
            return null
        }
    }
    
    this.getHierarchyPath = function(item) {
        
        // this is top level
        if (this.isMainGroup(item)) {
            return ""
        }
        
        // get the parent and display name
        var displayName = this.resolveDisplayName(item)
        var parent = this.getParent(item)
        
        // check the parent is there
        if (parent != null) {
            
            // append the parent's path and our display name
            return path.join(parent.getHierarchyPath(), displayName)
            
        } else {
            
            // just return the display name
            return displayName
        }
    }
    
    var getSourceTreeRealPath = function(item) {
        
        // get the source tree
        var sourceTree = item.sourceTree
        
        // from https://github.com/CocoaPods/Xcodeproj/blob/master/lib/xcodeproj/project/object/helpers/groupable_helper.rb#L115
        if (sourceTree == "<group>") {
            var parent = item.getParent()
            if (parent == null || parent.isa == "PBXProject") {
                return "" // TODO: should this be the projectDirPath or projectRoot from the rootObject?
            } else {
                return parent.getRealPath()
            }
        } else if (sourceTree == "SOURCE_ROOT") {
            return "" // TODO: should this be the projectDirPath or projectRoot from the rootObject?
        } else if (sourceTree == "<absolute>") {
            return null
        } else {
            return sourceTree
        }
    }
    
    this.getRealPath = function(item) {
    
        // get the resolved sourceTree
        var sourceTree = getSourceTreeRealPath(item)
        
        // get the path
        var realPath = ""
        if (item.path != null) {
            realPath = item.path
        }
        
        // see if we got a source tree
        if (sourceTree != null) {
            
            // join both the source tree and path
            return path.join(sourceTree, realPath)
            
        } else {
            
            // just reutrn the path
            return realPath
        }
    }
}

module.exports = function(dir) {
    
    this.dir = dir
    
    // load the raw .pbxproj file into memory
    var data = loadFromFile(path.join(dir, "project.pbxproj"))
    
    // get the root object
    var projectObject = data.objects[data.rootObject]
    
    // a group helper to track parents and paths, create the main group
    var groupHelper = new GroupHelper(dir)
    this.mainGroup = new PBXGroup(projectObject.mainGroup)
    groupHelper.setMainGroup(this.mainGroup)
    
    // create the targets
    this.targets = projectObject.targets.map(function(id) { return new PBXNativeTarget(id) })
    
    // the build phase object
    function PBXBuildPhase(id) {
        
        // track the type
        this.type = data.objects[id].isa
        
        // set the files if we have any
        if (data.objects[id].files != null) {
            this.files = data.objects[id].files.map(function(id) {
                return groupHelper.getItem(data.objects[id].fileRef)
            })
        }
    }
    
    // the target object
    function PBXNativeTarget(id) {
        
        this.id = id
        this.name = data.objects[id].name
        this.productName = data.objects[id].productName
        this.productType = data.objects[id].productType
        
        // add the build phases 
        if (data.objects[id].buildPhases != null) {
            this.buildPhases = data.objects[id].buildPhases.map(function(id) { return new PBXBuildPhase(id) })
        }
    }
    
    // the file object
    function PBXFileReference(id) {
        
        this.id = id
        this.isa = data.objects[id].isa
        this.name = data.objects[id].name
        this.path = data.objects[id].path
        this.sourceTree = data.objects[id].sourceTree
        this.getParent = function() { return groupHelper.getParent(this) }
        this.getDisplayName = function() { return groupHelper.resolveDisplayName(this) }
        this.getHierarchyPath = function() { return groupHelper.getHierarchyPath(this) }
        this.getRealPath = function() { return groupHelper.getRealPath(this) }
    }
    
    // the group object
    function PBXGroup(id) {
        
        this.id = id
        this.isa = data.objects[id].isa
        this.name = data.objects[id].name
        this.path = data.objects[id].path
        this.sourceTree = data.objects[id].sourceTree
        this.getParent = function() { return groupHelper.getParent(this) }
        this.getDisplayName = function() { return groupHelper.resolveDisplayName(this) }
        this.getHierarchyPath = function() { return groupHelper.getHierarchyPath(this) }
        this.getRealPath = function() { return groupHelper.getRealPath(this) }
        
        // check and parse children
        var parentId = id
        if (data.objects[id].children != null) {
            this.children = data.objects[id].children.map(function(id) {
                
                // get the isa of the child
                var isa = data.objects[id].isa
                var item
                
                // return the right object based on the isa
                if (isa == "PBXGroup" || isa == "PBXVariantGroup") {
                    item = new PBXGroup(id) 
                } else if (isa == "PBXFileReference") {
                    item = new PBXFileReference(id) 
                } else {
                    return id // failed to map
                }
                
                // track the item in the group helper
                groupHelper.trackItemWithParentId(item, parentId)
                
                // return the item
                return item
            })
        }
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

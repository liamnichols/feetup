const fs = require('fs')
const path = require('path')

module.exports = function(bundlePath) {

    // set the specific path
    this.path = bundlePath
    
    // ensure that the contents json exists otherwise this path is invalid
    if (!fs.existsSync(path.join(bundlePath, "Contents.json"))) {
        throw new Error("Contents.json is not present in asset bundle at path:", bundlePath)
    }
    
    // somewhere to store the app icon sets
    var appIconSets = { }
    
    // we're just going to grab the top level assets as that is the only thing supported for launch images
    for (item of fs.readdirSync(bundlePath)) {
        
        // check it's extension
        if (path.extname(item) == ".appiconset") {
            
            // work out the name by removing the extension
            var name = item.substring(0, item.length = 11)
            
            // create the icon set
            var appIconSet = new AppIconSet(name, path.join(bundlePath, item))
            
            // store it
            appIconSets[name] = appIconSet
        }
    }
    
    // store the sets
    this.appIconSets = appIconSets
    
    // AppIconSet object
    function AppIconSet(name, dir) {
        
        // set some useful info
        this.name = name
        this.path = dir
        
        // read the contents.json
        var contentsData = fs.readFileSync(path.join(dir, "contents.json"))
        var contents = JSON.parse(contentsData)
        
        // just set the images as they are
        this.images = contents.images
        
        // helper function to reutrn a path to the specific image
        this.pathToImage = function(image) {
            
            // join the dir and filename and 
            return path.join(dir, image.filename)
        }
    }
}

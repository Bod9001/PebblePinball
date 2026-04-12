export const StorageManager = {
  layoutsPath: "layouts/",
  indexPath: "layouts/index.json",
  
  saveLayout(layoutConfig) {
    try {
      console.log("Starting!!");
      const nLine = layoutConfig.split("\n").find(l => l.startsWith("N "));
      const name = nLine ? nLine.slice(2).trim() : "unknown";
      
      const filePath = this.layoutsPath + name + ".txt";
      
      // Delete old file if exists
      try {
        device.files.delete(filePath);
      } catch (e) {
        // File doesn't exist yet, that's fine
      }
      
      // Write new file
      const data = ArrayBuffer.fromString(layoutConfig);
      const file = device.files.openFile({
        path: filePath,
        mode: "r+",
        size: data.byteLength
      });
      file.write(data, 0);
      file.close();
      
      // Update index
      
      try {
        let index = this.getIndex();
         console.log("index >>!!" , index);
        // Add if not already present
        if (!index.includes(name)) {
          index.push(name);
        }
        console.log("index nnew >>!!" , index);
        localStorage.setItem(`layouts/index.json`,JSON.stringify(index));
        console.log("index nnew  saveed>>!!" , JSON.stringify(index));
      } catch (e) {
        console.log("Index update error: " + e);
      }      
      //this.addToIndex(name);
      console.log("Layout saved: " + name);
      return true;
    } catch (e) {
      console.log("Save error: " + e);
      return false;
    }
  },
        /*/
  deleteLayout(name) {
    try {
      const filePath = this.layoutsPath + name + ".json";
      device.files.delete(filePath);
      this.removeFromIndex(name);
      console.log("Layout deleted: " + name);
      return true;
    } catch (e) {
      console.log("Delete error: " + e);
      return false;
    }
  },
    /*/

  getIndex() 
{
    try {

      console.log("device");

      let Index = localStorage.getItem(`layouts/index.json`);
      console.log("Index", Index);
      if (Index == null){
          localStorage.setItem(`layouts/index.json`, JSON.stringify([]));
          Index = "[]";
      }
      console.log("Index", Index);
      return JSON.parse(Index);
    } catch (e) {
      console.log("Index read error: " + e);
    }
    return [];
  },
    /*/
  removeFromIndex(name) {
    try {
      let index = this.getIndex();
      index = index.filter(n => n !== name);
      
      // Delete old index
      try {
        device.files.delete(this.indexPath);
      } catch (e) {
        // Doesn't exist yet
      }
      
      // Write new index
      const indexStr = JSON.stringify(index);
      const data = ArrayBuffer.fromString(indexStr);
      const file = device.files.openFile({
        path: this.indexPath,
        mode: "r+",
        size: data.byteLength
      });
      file.write(data, 0);
      file.close();
    } catch (e) {
      console.log("Index remove error: " + e);
    }
  },
    /*/
  /*/
  clearAll() {
    try {
      const index = this.getIndex();
      
      // Delete all layout files
      for (const name of index) {
        try {
          const filePath = this.layoutsPath + name + ".json";
          device.files.delete(filePath);
        } catch (e) {
          // Continue if one fails
        }
      }
      
      // Delete index file
      try {
        device.files.delete(this.indexPath);
      } catch (e) {
        // Doesn't exist
      }
      
      console.log("All layouts cleared");
      return true;
    } catch (e) {
      console.log("Clear error: " + e);
      return false;
    }
   
  }
   /*/
};
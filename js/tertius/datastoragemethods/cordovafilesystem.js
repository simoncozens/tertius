if (!Tertius) Tertius = {};
if (!Tertius.DataStorageMethods) Tertius.DataStorageMethods = {};
Tertius.DataStorageMethods.CordovaFilesystem = {
	loadJSON: function (filename, intoWhere, andThen) {
    /* To understand this function, start at the last line and read upwards. :( */

    var fail = andThen || function(){}; /* The show must go on */

    var _gotFile = function(file) {
      var reader = new FileReader();
      reader.onloadend = function(evt) {
        try {
        var res = JSON.parse(evt.target.result);
        } catch(e) {}
        if (res) intoWhere[filename] = res;
        if (andThen) andThen();
      };
      reader.onerror = function(e) { console.log(e); };
      reader.readAsText(file);
      if (file.size == 0) fail();
    };

    var _gotFileEntry = function (e) { e.file(_gotFile, fail); };
    var _gotFS = function (fs) {
      Tertius.DataStorageMethods.CordovaFilesystem._fs = fs.root; // Cache this to save a step next time.
      fs.root.getFile(filename+".json", {create: true, exclusive: false}, _gotFileEntry, fail);
    };
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, _gotFS, fail);
	},
  saveJSON: function (filename, object) {
    var fail = function(e) { console.log(e); };
    var _write = function(writer) {writer.write(JSON.stringify(object)); };
    var _gotFileEntry = function (e) { e.createWriter(_write, fail); };
    Tertius.DataStorageMethods.CordovaFilesystem._fs.getFile(
      filename+".json", {create: true, exclusive: false}, _gotFileEntry, fail
    );
	}
};
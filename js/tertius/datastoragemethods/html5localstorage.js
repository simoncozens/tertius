if (!Tertius) Tertius = {};
if (!Tertius.DataStorageMethods) Tertius.DataStorageMethods = {};
Tertius.DataStorageMethods.HTML5LocalStorage = {
  loadJSON: function (filename, intoWhere, andThen) {
    var newObj;
    try {
      newObj = JSON.parse(localStorage.getItem(filename));
      if (typeof(newObj)=="object") intoWhere[filename] = newObj;
    }catch(e){ console.log(e); }
      if (andThen) andThen();
  },
  saveJSON: function (filename, object) {
    console.log("Saving "+filename);
    localStorage.setItem(filename, JSON.stringify(object));
  }
};
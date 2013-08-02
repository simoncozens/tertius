if (!Tertius) Tertius = {};
if (!Tertius.DataStorageMethods) Tertius.DataStorageMethods = {};
Tertius.DataStorageMethods.HTML5LocalStorage = {
	loadJSON: function (filename, intoWhere, andThen) {
    intoWhere[filename] = JSON.parse(localStorage.getItem(filename)) || [];
    andThen();
	},
  saveJSON: function (filename, object) {
    localStorage.setItem(filename, JSON.stringify(object));
	}
};
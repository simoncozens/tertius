Tertius.config = {
	loader: "sqlNW",
	bibles: [ "LEB", "net", "sbl" ],
	tools: [ ],
	UI: Tertius.UIs.NodeWebkit,
    bibleReadingPlans: ["bible-in-a-year"],
    //DataStorage: Tertius.DataStorageMethods.CordovaFilesystem,
    DataStorage: Tertius.DataStorageMethods.HTML5LocalStorage,
	start: ["John", 3]
};

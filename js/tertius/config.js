Tertius.config = {
	loader: "splitXml",
	bibles: [ "LEB", "kjv", "sbl", "wlc" ],
	tools: ["strongs-greek"],
	UI: Tertius.UIs.JQM,
    bibleReadingPlans: ["bible-in-a-year"],
    //DataStorage: Tertius.DataStorageMethods.CordovaFilesystem,
    DataStorage: Tertius.DataStorageMethods.HTML5LocalStorage,
	start: ["John", 3]
};

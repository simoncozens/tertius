Tertius.SettingsManager = {
  settings: {
    fontSize: "100",
    ruby: "1"
  },
  load: function(cb) {
    Tertius.DataStorage.loadJSON("settings", Tertius.SettingsManager, cb);
  },
  save: function() {
    Tertius.DataStorage.saveJSON("settings", Tertius.SettingsManager);
  },
};
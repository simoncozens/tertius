Tertius.SettingsManager = {
  defaultSettings: {
    fontSize: "100",
    ruby: "1"
  },
  load: function(cb) {
    Tertius.DataStorage.loadJSON("settings", Tertius.SettingsManager, function() {
      if (!Tertius.SettingsManager.settings) Tertius.SettingsManager.settings = Tertius.SettingsManager.defaultSettings;
      cb();
    });
  },
  save: function() {
    Tertius.DataStorage.saveJSON("settings", Tertius.SettingsManager.settings);
  },
};
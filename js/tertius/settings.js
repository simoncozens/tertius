Tertius.SettingsManager = {
  defaultSettings: {
    fontSize: "100",
    ruby: "1",
    presentation: "parallel"
  },
  load: function(cb) {
    Tertius.DataStorage.loadJSON("settings", Tertius.SettingsManager, function() {
      if (!Tertius.SettingsManager.settings) Tertius.SettingsManager.settings = {};
      for (k in Tertius.SettingsManager.defaultSettings) 
      if (!Tertius.SettingsManager.settings[k]) Tertius.SettingsManager.settings[k] = Tertius.SettingsManager.defaultSettings[k];
      cb();
    });
  },
  save: function() {
    Tertius.DataStorage.saveJSON("settings", Tertius.SettingsManager.settings);
  },
};
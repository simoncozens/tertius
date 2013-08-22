// Plans available should be stored in config; plans selected should be stored in settings.
Tertius.BibleReading = {
  plans: {},
  setup: function(){
    // I wanted to lazily load these but the information is stored inside them...
    for (i in Tertius.config.bibleReadingPlans) {this.loadOne(Tertius.config.bibleReadingPlans[i]); }
  },
  loadOne: function(name) {
    if (!Tertius.BibleReading.plans[name]) {
      console.log("tools/"+name+".json");
      $.ajax({
        url: "tools/"+name+".json",
        dataType: "json",
        async: false,
        error: function (j, text, error) { console.log(text); console.log(error); console.log(j);}
      }).done(function (json) {
        Tertius.BibleReading.plans[name] = json;
      });
    }
    return Tertius.BibleReading.plans[name];
  },
  dayOfYear: function() {
    var now = new Date();
    var secondsSinceStartOfYear = now - new Date(now.getFullYear(), 0, 0);
    return Math.floor(secondsSinceStartOfYear / 864E5);
  },
  todaysReading: function() {
    if (!Tertius.SettingsManager.settings.bibleReadingPlan) return;
    var plan = Tertius.BibleReading.plans[Tertius.SettingsManager.settings.bibleReadingPlan];
    if (!plan) return;
    console.log()
    Tertius.search(plan.days[Tertius.BibleReading.dayOfYear()]);
  }
};
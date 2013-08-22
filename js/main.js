Tertius = {
  Bibles: {},
  BibleSources: {},
  Tools: {},
  state: {},
  nonce: 0,
  bcv: (new bcv_parser()),
  setup: function() {
    Tertius.UI = Tertius.config.UI;
    Tertius.DataStorage = Tertius.config.DataStorage;
    var env = Tertius.BibleSources[Tertius.config.loader];
    Tertius.config.tools.forEach(function(t) {Tertius.ToolSources[Tertius.config.loader].load(t); });
    Tertius.BibleReading.setup();
    Tertius.SettingsManager.load(function() {
      Tertius.HistoryAndBookmarks.load(function() {
        Tertius.UI.setup();
        Tertius.config.bibles.forEach(function(b) {
          env.load(b, function() {
            Tertius.UI.rebuildBibleMenu();
            if (Tertius.config.start && b == Tertius.config.bibles[Tertius.config.bibles.length-1]) {
              Tertius.startUp();
            } 
          });
        });      
      });
    });
  },
  startUp: function() {
    if (Tertius.HistoryAndBookmarks.history[0]) {
      Tertius.HistoryAndBookmarks.select("history", 0);
    }
    else if (Tertius.config.start) {
      Tertius.state.book = Tertius.config.start[0];
      Tertius.state.chapter = Tertius.config.start[1];
      Tertius.showChapter(Tertius.state.book, Tertius.state.chapter);
    }
  },
  search: function(ref) {
    console.log("Going to "+ref);
    Tertius.nonce = 0;
    var bibleRef = Tertius.bcv.parse(ref);
    if (bibleRef.osis()) {
        return this.showBible(bibleRef);
    }
    // Reference parsing failed, it's a word search
    this.wordSearch(ref);
  },
  wordSearch: function (word) {
    Tertius.UI.prepareSearchResults(word);
    var bibles = Tertius.UI.currentBibles();
    for (var bIndex = 0; bIndex < bibles.length; bIndex++) {
      bibles[bIndex].search(word, Tertius.UI.showSearchResultHandler);
    }
    Tertius.state.currentSearch = {
      type: "search", terms: word, bibles: Tertius.UI.currentBibles().map(function (x) {return x.abbrev; })
    };
    Tertius.HistoryAndBookmarks.record("history");
  },
  showBible: function(ref) {
    // Prepare rows to receive results
    var i = ref.verse_iterator();
    Tertius.UI.prepareVerseResults(i);
    var bibles = Tertius.UI.currentBibles();
    var c = ref.contiguous_verse_range_iterator();
    while (r = c.next()) {
      var mo = r.match(/(\w+)\.(\d+)\.(\d+)(?:\-(\d+))?/);
      var bk = mo[1]; var ch = mo[2]; var start = mo[3]; var end = mo[4] || mo[3];
      for (var bIndex = 0; bIndex < bibles.length; bIndex++) {
        bibles[bIndex].lookup(bk, ch, start, end, Tertius.UI.showBibleResultHandler);
      }
    }
    Tertius.state.currentSearch = {
      type: "bible", reference: ref.osis(), bibles: Tertius.UI.currentBibles().map(function (x) {return x.abbrev; })
    };    
    Tertius.HistoryAndBookmarks.record("history");
    // XXX Hack
    var h = ref.verse_iterator();
    h.next();
    Tertius.state.book = h.bkPtr; 
    Tertius.state.chapter = h.chPtr;
  },
  showChapter: function (book, chapter, cb) {
    Tertius.nonce = 0;
    this.search(Tertius.state.book+ " "+Tertius.state.chapter);
    if (cb) cb();
  },
};

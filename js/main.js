Tertius = {
  Bibles: {},
  BibleSources: {},
  Tools: {},
  state: {},
  nonce: 0,
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
    Tertius.nonce = 0;
    try {
      var bibleRef = BibleRefParser(ref);
      if (bibleRef) {
        return this.showBible(bibleRef);
      }
    } catch (e) {
      console.log(e); // We presume...
      // Reference parsing failed, it's a word search
      this.wordSearch(ref);
    }
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
    var i = ref.iterator();
    Tertius.UI.prepareVerseResults(i);
    var bibles = Tertius.UI.currentBibles();
    for (var rIndex = 0; rIndex < ref.references.length; rIndex++) {
      var r = ref.references[rIndex];
      for (var bIndex = 0; bIndex < bibles.length; bIndex++) {
        bibles[bIndex].lookup(r.bookId, r.chapter, r.startVerse, r.endVerse, Tertius.UI.showBibleResultHandler);
      }
    }
    Tertius.state.currentSearch = {
      type: "bible", reference: ref, bibles: Tertius.UI.currentBibles().map(function (x) {return x.abbrev; })
    };    
    Tertius.HistoryAndBookmarks.record("history");
    // XXX Hack
    Tertius.state.book = ref.references[0].bookId; 
    Tertius.state.chapter = ref.references[0].chapter;
  },
  showChapter: function (book, chapter, cb) {
    Tertius.nonce = 0;
    this.search(Tertius.state.book+ " "+Tertius.state.chapter);
    if (cb) cb();
  },
};

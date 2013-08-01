Tertius = {
  Bibles: {},
  BibleSources: {},
  state: {},
  nonce: 0,
  setup: function() {
    Tertius.UI = Tertius.config.UI;
    Tertius.DataStorage = Tertius.config.DataStorage;
    var env = Tertius.BibleSources[Tertius.config.loader];
    Tertius.UI.setup();
    Tertius.HistoryAndBookmarks.load(function() {
      if (Tertius.config.start) {
        Tertius.state.book = Tertius.config.start[0];
        Tertius.state.chapter = Tertius.config.start[1];
      }
      Tertius.config.bibles.forEach(function(b) {
        env.load(b, function() {
          Tertius.UI.rebuildBibleMenu();
          if (Tertius.config.start && b == Tertius.config.bibles[Tertius.config.bibles.length-1]) Tertius.UI.showChapter();
        });
      });
    });
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
    Tertius.UI.currentBibles().forEach(function (b) {
      b.search(word, Tertius.UI.showSearchResultHandler);
    });
    Tertius.state.currentSearch = {
      type: "search", terms: word, bibles: Tertius.UI.currentBibles().map(function (x) {return x.abbrev; })
    };
    Tertius.HistoryAndBookmarks.record("history");
  },
  showBible: function(ref) {
    // Prepare rows to receive results
    var i = ref.iterator();
    Tertius.UI.prepareVerseResults(i);
    ref.references.forEach( function(r) {
      Tertius.UI.currentBibles().forEach(function (b) {
        b.lookup(r.bookId, r.chapter, r.startVerse, r.endVerse, Tertius.UI.showBibleResultHandler);
      });
    });
    Tertius.state.currentSearch = {
      type: "bible", reference: ref, bibles: Tertius.UI.currentBibles().map(function (x) {return x.abbrev; })
    };    
    Tertius.HistoryAndBookmarks.record("history");
  },
  showChapter: function (book, chapter, cb) {
    Tertius.nonce = 0;
    this.search(Tertius.state.book+ " "+Tertius.state.chapter);
    if (cb) cb();
  },
  processContent: function(c) {
    c = $(c);
    c.find("note").replaceWith(function() {
      var note = $("<p></p>").append(this.innerHTML);
      Tertius.nonce++;
      var popup = $('<div class=\"footnote\" data-role=\"popup\" data-overlay-theme="a" id=\"popup-'+Tertius.nonce+'\" data-tolerance="15">').append(note);
      return $("<span><a data-role=\"popup-trigger\" data-popup-id=\"popup-"+Tertius.nonce+"\"> <sup>"+Tertius.nonce+"</sup> </a></span>").append(popup);
    });
    return c;
  }
};

Tertius = {
  Bibles: {},
  BibleSources: {},
  state: {},
  setup: function() {
    Tertius.UI = Tertius.config.UI;
    var env = (window.device && window.device.platform) ? Tertius.BibleSources.sql : Tertius.BibleSources.xml;
    Tertius.config.bibles.forEach(function(b) {
      env.load(b, Tertius.UI.rebuildBibleMenu);
    });
    Tertius.UI.setup();
  },
  search: function(ref) {
    var iterators = [];
    try {
      var bibleRef = BibleRefParser(ref);
      if (bibleRef) {
        return this.showBible(bibleRef);
      }
    } catch (e) {
      Tertius.UI.prepareSearchResults(ref);
      Tertius.UI.currentBibles().forEach(function (b) {
        b.search(ref, Tertius.UI.showSearchResultHandler);
      });      
    };
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
  },
  showChapter: function (book, chapter, cb) {
    this.search(Tertius.state.book+ " "+Tertius.state.chapter);
    if (cb) cb();
  }
};

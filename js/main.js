Tertius = {
  Bibles: {},
  BibleSources: {},
  setup: function() {
    Tertius.UI = Tertius.UIs.JQM;
    var env = (window.device && window.device.platform) ? Tertius.BibleSources.sql : Tertius.BibleSources.xml;
    env.load("net", Tertius.UI.rebuildBibleMenu);
    env.load("shinkyodo", Tertius.UI.rebuildBibleMenu);
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

};

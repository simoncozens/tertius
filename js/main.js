Tertius = {
  Bibles: {},
  BibleSources: {},
  setup: function() {
    Tertius.UI = Tertius.UIs.JQM;
    var env = (device && device.platform) ? Tertius.BibleSources.sql : Tertius.BibleSources.xml;
    env.load("net", Tertius.UI.rebuildBibleMenu);
    env.load("shinkyodo", Tertius.UI.rebuildBibleMenu);
    Tertius.UI.setup();
  },
  search: function(ref) {
    var iterators = [];
    var bibleRef = BibleRefParser(ref);
    if (bibleRef) {
      return this.showBible(bibleRef);
    }
    // It's a word search
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

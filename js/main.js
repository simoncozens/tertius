Tertius = {
  Bibles: {},
  BibleSources: {},
  state: {},
  nonce: 0,
  setup: function() {
    Tertius.UI = Tertius.config.UI;
    var env = Tertius.BibleSources[Tertius.config.loader];
    Tertius.UI.setup();
    if (Tertius.config.start) {
      Tertius.state.book = Tertius.config.start[0];
      Tertius.state.chapter = Tertius.config.start[1];
    }
    Tertius.config.bibles.forEach(function(b) {
      env.load(b, function() {
        Tertius.UI.rebuildBibleMenu();
        if (Tertius.config.start) Tertius.UI.showChapter();
      });
    });
  },
  search: function(ref) {
    Tertius.nonce = 0;
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
    Tertius.nonce = 0;
    this.search(Tertius.state.book+ " "+Tertius.state.chapter);
    if (cb) cb();
  },
  processContent: function(c) {
    c = $(c);
    c.find("note").replaceWith(function() {
      var note = $("<p></p>").append(this.innerHTML);
      Tertius.nonce++;
      var popup = $('<div data-role=\"popup\" data-overlay-theme="a" id=\"popup-'+Tertius.nonce+'\" data-tolerance="15">').append(note);
      return $("<span><a data-role=\"popup-trigger\" data-popup-id=\"popup-"+Tertius.nonce+"\"><sup>"+Tertius.nonce+"</sup></a></span>").append(popup);
    });
    return c;
  }
};

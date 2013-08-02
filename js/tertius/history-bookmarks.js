/* History and bookmarks are basically the same; history is a bookmark
   list that is automatically saved every time you access something new.
   So they are implemented with pretty much the same code.*/

Tertius.HistoryAndBookmarks = {
  history: [],
  bookmarks:[],
  maxLength: 20,
  load: function(cb) {
    Tertius.DataStorage.loadJSON("history", Tertius.HistoryAndBookmarks, function(){
      Tertius.DataStorage.loadJSON("bookmarks", Tertius.HistoryAndBookmarks, cb);
    });
  },
  save: function() {
    Tertius.DataStorage.saveJSON("history", Tertius.HistoryAndBookmarks.history);
    Tertius.DataStorage.saveJSON("bookmarks", Tertius.HistoryAndBookmarks.bookmarks);
  },
  show: function (actingAs) {
    var list = [];
    this[actingAs].forEach( function(entry, id) {
      if (entry.type == "bible") {
        list[id] = BibleRefParser.resultMethods.toString.bind(entry.reference)(); // Because JSON splats the prototype
      } else if (entry.type == "search") { // There are *currently* no other types but this may change...
        list[id] = '"' + entry.terms + '"';
      }
      list[id] += " (" +entry.bibles.join(",")+")";
    } );
    Tertius.UI.showHistoryBookmarks(actingAs, list);
  },
  select: function (actingAs, id) {
    var list = Tertius.HistoryAndBookmarks[actingAs];
    if (id == -1) {
      Tertius.HistoryAndBookmarks.record(actingAs);
      return;
    }
    // Move to front
    var entry= list[id];
    list.unshift(list.splice(entry,1)[0]);
    Tertius.HistoryAndBookmarks.save();
    // Replay the latest entry
    Tertius.UI.setCurrentBibles(entry.bibles);
    if (entry.type == "search") return Tertius.wordSearch(entry.terms);
    if (entry.type == "bible") {
      // XXX Unsmash the reference
      entry.reference = BibleRefParser(BibleRefParser.resultMethods.toString.bind(entry.reference)());
      return Tertius.showBible(entry.reference);
    }
  },
  record: function (actingAs) {
    var list = Tertius.HistoryAndBookmarks[actingAs];
    // If this object is already in the list, bring it to the top.

    /* In general this is a bad solution for deep comparison but for this specific case,
    the same code is generating each of the objects we are testing against, so order of 
    properties etc. is guaranteed */
    var _crappyDeepCompare =  function(o1, o2) { return JSON.stringify(o1) === JSON.stringify(o2); };

    var seen = 0;
    var obj = Tertius.state.currentSearch;
    list.forEach( function(existingEntry, id) {
      if (_crappyDeepCompare(obj,existingEntry)) {
        seen = 1;
        list.unshift(list.splice(id,1)[0]); // Remove it and lift it to the top
      }
    });
    if (seen === 0) list.unshift(obj);
    if (list.length > this.maxLength) list.pop();
    this.save();
  }
};
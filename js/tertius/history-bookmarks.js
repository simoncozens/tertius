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
    var list = {};
    if (actingAs == "bookmark") list[-1] = "Save as bookmark";
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
  select: function () {
    var entry = SpinningWheel.getSelectedValues().keys[0];
    if (entry == -1) {
      Vibi.Bookmarks.record();
      return;
    }
    // Move to front
    Vibi.verseSelection = Vibi.bookmarks[entry];
    Vibi.bookmarks.unshift(Vibi.bookmarks.splice(entry,1)[0]);
    Vibi.Bookmarks.save();
    Vibi.bookChangeHandler();
  },
  record: function (actingAs, obj) {
    obj.bibles = Tertius.UI.currentBibles().map(function (x) {return x.abbrev; });
    var list = Tertius.HistoryAndBookmarks[actingAs];
    // If this object is already in the list, bring it to the top.

    /* In general this is a bad solution for deep comparison but for this specific case,
    the same code is generating each of the objects we are testing against, so order of 
    properties etc. is guaranteed */
    var _crappyDeepCompare =  function(o1, o2) { return JSON.stringify(o1) === JSON.stringify(o2); };

    var seen = 0;
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
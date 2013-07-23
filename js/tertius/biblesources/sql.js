Tertius.BibleSources.sql = {
  load: function (name,cb) {
    var bible = window.sqlitePlugin.openDatabase({name: name});
    $.extend(bible, Tertius.BibleSources.sql);
    bible.transaction(function(tx) {
      var options = {};
      tx.executeSql("select * from metadata", [], function(tx,res) {
        name = res.rows.item(0).name;
        var len = res.rows.length, i;
        for (i = 0; i < len; i++) {
          var row = res.rows.item(i);
          options[row.k] = row.v;
        }
        bible.options = options;
        bible.name = options.abbrev;
        Tertius.Bibles[options.abbrev] = bible;
        cb();
      });
    });
  },
  _sql_search: function(query, params, cb) {
    var results = [];
    var that = this;
    this.transaction(function(tx) {
      tx.executeSql(query, params, function(tx, res) {
        var len = res.rows.length, i;
        for (i = 0; i < len; i++) {
          var row = res.rows.item(i);
          results.push(row);
        }
        cb(that,results);
      });
    });
  },
  lookup: function(book, chapter, v1, v2, cb) {
    this._sql_search("select * from bible where book=? and chapter=? and verse >= ? and verse <= ?", [book, chapter, v1,v2],cb);
  },
  search: function(text,cb) {
    var query;
    if (this.options.fts) {
      query = "SELECT bible_fts.book, bible_fts.chapter, bible_fts.verse, bible.content FROM bible_fts, bible WHERE bible_fts.content MATCH ? AND bible_fts.book = bible.book AND bible_fts.chapter=bible.chapter AND bible_fts.verse = bible.verse";
    } else {
      query = "SELECT book, chapter, verse FROM bible where content LIKE ?";
    }
    this._sql_search(query, [text], cb);
  }
};
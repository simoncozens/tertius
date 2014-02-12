Tertius.BibleSources.sqlNW = {
  load: function (filename,cb) {
    var sqlite3 = require('sqlite3').verbose();
    var bible = new sqlite3.Database("bibles/"+filename+".db");
    $.extend(bible, Tertius.BibleSources.sqlNW);
    bible.serialize(function() {
      var options = {};
      bible.all("select * from metadata", function(err,rows) {
        for (i = 0; i < rows.length; i++) {
          var row = rows[i];
          options[row.k] = row.v;
        }
        bible.options = options;
        bible.abbrev = options.abbrev;
        bible.name = options.name;
        Tertius.Bibles[options.abbrev] = bible;
        console.log(bible);
        cb();  
      });
    });
  },
  _sql_search: function(query, params, cb) {
    var results = [];
    var that = this;
    this.serialize(function(tx) {
      var results;
      that.all(query, params, function(err, results) {
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

/* 
SQL Bible driver
================

On mobile devices, verse lookup and searching is much faster if it's not all
done in memory and if it's backed by something like SQLite to improve the
retrieval. With the Cordova platform this is something we can achieve,
although it means squeezing the text into a SQLite database.

In the mobile Tertius app, we use a hacked version of the Cordova SQLite
plugin which copies the databases from the app's Resources directory into
the user's Documents directory.

Expectations
------------

To concoct a Bible SQLite file for Tertius, first create the following
schema:

    CREATE TABLE bible (book, chapter INTEGER, verse INTEGER, content TEXT, PRIMARY KEY(book, chapter, verse));
    CREATE TABLE metadata (k,v);

The metadata table is a simple key-value store. You will want to provide
the key `abbrev`, which is the abbreviated name of the Bible. Other
metadata keys will be defined soon.

Now put your Bible content in, using OSIS book abbreviations for the book
column and HTML text for the content column.

If you want to provide full-text search with proper stemming and tokenizing
and so on, then do this:

  CREATE VIRTUAL TABLE bible_fts USING fts3(book, chapter INTEGER, verse INTEGER, content TEXT);
  INSERT INTO metadata VALUES ("fts", 1);

And insert plain-text content into the `bible_fts` table.

*/
var sqlOpener;
if (window.cordova) {
  sqlOpener = function (f) { return window.sqlitePlugin.openDatabase({name: f }); };
} else {
  sqlOpener = function (f) { return window.openDatabase(filename, '1.0', 'A bible '+filename, 16*1024*1024); };
}

Tertius.BibleSources.sql = {
  load: function (filename,cb) {
    var bible = sqlOpener(filename);
    console.log(filename);
    $.extend(bible, Tertius.BibleSources.sql);
    bible.transaction(function(tx) {
      var options = {};
      tx.executeSql("select * from metadata", [], function(tx,res) {
        var len = res.rows.length, i;
        for (i = 0; i < len; i++) {
          var row = res.rows.item(i);
          console.log(row.k+": "+row.v);
          options[row.k] = row.v;
        }
        bible.options = options;
        bible.abbrev = options.abbrev;
        bible.name = options.name;
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
      text = "%" + text + "%";
      query = "SELECT book, chapter, verse FROM bible where content LIKE ?";
    }
    this._sql_search(query, [text], cb);
  }
};

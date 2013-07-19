Tertius.BibleSources.sql = {
  load: function (name,cb) {
    var bible = window.sqlitePlugin.openDatabase({name: name});
    $.extend(bible, Tertius.BibleSources.sql);
    var name;
    bible.transaction(function(tx) {
      tx.executeSql("select name from metadata", [], function(tx,res) {
        name = res.rows.item(0).name;
        bible.name = name;
        Tertius.Bibles[name] = bible;
        cb();
      });
    });
  },
  lookup: function(book, chapter, v1, v2, cb) {
    var results = [];
    var that = this;
    this.transaction(function(tx) {
      tx.executeSql("select * from bible where book=? and chapter=? and verse >= ? and verse <= ?",
        [book, chapter, v1, v2], function(tx, res) {
        var len = res.rows.length, i;
        for (i = 0; i < len; i++) {
          var row = res.rows.item(i);
          results.push(row);
        }
        cb(that,results);
      });
    });
  },

  search: function() {

  }
};
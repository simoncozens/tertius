if (!Tertius.ToolSources) Tertius.ToolSources = {};
Tertius.ToolSources.sql = {
  load: function (filename,cb) {
    if (Tertius.Tools[filename]) { if (cb) return cb(); }

    Tertius.Tools[filename] = window.sqlitePlugin.openDatabase({name: filename});
    $.extend(Tertius.Tools[filename] , Tertius.ToolSources.sql);
    if (cb) cb();
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
  lookup: function (termKey, termValue, cb) {
    this._sql_search("SELECT * FROM lexicon WHERE "+termKey+"=?", [termValue], cb);
  }
};
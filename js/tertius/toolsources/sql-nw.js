if (!Tertius.ToolSources) Tertius.ToolSources = {};
Tertius.ToolSources.sqlNW = {
  load: function (filename,cb) {
    if (Tertius.Tools[filename]) { if (cb) return cb(); }
    var sqlite3 = require('sqlite3').verbose();
    Tertius.Tools[filename] = new sqlite3.Database("tools/"+filename+".db");
    $.extend(Tertius.Tools[filename] , Tertius.ToolSources.sqlNW);
    if (cb) cb();
  },
  _sql_search: function(query, params, cb) {
    var results = [];
    var that = this;
    this.serialize(function() {
      that.all(query, params, function(tx, results) {
        cb(that,results);
      });
    });
  },
  lookup: function (termKey, termValue, cb) {
    this._sql_search("SELECT * FROM lexicon WHERE "+termKey+"=?", [termValue], cb);
  }
};

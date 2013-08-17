if (!Tertius.ToolSources) Tertius.ToolSources = {};
Tertius.ToolSources.splitXml = Tertius.ToolSources.xml = {
  load: function (name,cb) {
    console.log("Loading "+name);
    $.ajax({
      url: "tools/"+name+".xml",
      dataType: "xml",
      async: false,
      error: function (j, text, error) { console.log(text);  console.log(j);}
    }).done(function (tool) {
      console.log("Got text");
      $.extend(tool, Tertius.ToolSources.xml);
      Tertius.Tools[name] = tool;
      if (cb) cb();
    });
  },
  _search: function(query, cb) {
    var versit = this.evaluate(query, this, null, 0, null);
    var results = [];
    while (verse = versit.iterateNext()) {
      results.push({ content: (new XMLSerializer()).serializeToString(verse)
                   });
    }
    cb(this,results);
  },
  lookup: function(termKey, termValue, cb) {
    this._search("//entry[@"+termKey+"="+termValue+"]", cb);
  },
};
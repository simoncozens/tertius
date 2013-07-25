Tertius.BibleSources.xml = {
  load: function (name,cb) {
    console.log("Loading "+name);
    $.ajax({
      url: name+".xml",
      dataType: "xml",
      async: false,
      error: function (j, text, error) { console.log(text);  console.log(j);}
    }).done(function (bible) {
      console.log("Got text");
      $.extend(bible, Tertius.BibleSources.xml);
      bible.name = bible.documentElement.getAttribute("name");
      Tertius.Bibles[bible.name] = bible;
      cb();
    });
  },

  _search: function(query, cb) {
    var versit = this.evaluate(query, this, null, 0, null);
    var results = [];
    while (verse = versit.iterateNext()) {
      results.push({ book: verse.parentNode.parentNode.getAttribute("num"),
                     chapter: verse.parentNode.getAttribute("num"),
                     verse: verse.getAttribute("num"),
                     content: (new XMLSerializer()).serializeToString(verse)
                   });
    }
    cb(this,results);
  },
  lookup: function(book, chapter, v1, v2, cb) {
    this._search("//bible/book[@num=\""+book+"\"]/chapter[@num="+chapter+"]/verse[@num >= "+v1+" and @num <= "+v2+"]", cb);
  },
  search: function(text, cb) {
    this._search("//text()[contains(.,'"+text+"')]/ancestor::verse", cb);
  }
};
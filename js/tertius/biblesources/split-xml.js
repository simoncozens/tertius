/* 
Split XML Bible driver
======================

So the XML driver was a good idea in theory and helped get things prototyped but for
real life use, it gets bogged down pretty quickly loading large DOM trees into memory.

This is a workaround.

*/

Tertius.BibleSources.splitXml = {
  load: function (name,cb) {
    console.log("Loading "+name);
    $.ajax({
      url: "bibles/"+name+".xml",
      dataType: "xml",
      async: false,
      error: function (j, text, error) { console.log(text);  console.log(j);}
    }).done(function (bible) {
      console.log("Got text");
      $.extend(bible, Tertius.BibleSources.splitXml);
      bible.name = bible.documentElement.getAttribute("name");
      bible.abbrev = bible.documentElement.getAttribute("abbrev");
      bible.books = {};
      var bookIt = bible.evaluate("//bible/book", bible, null, 0, null);
      while (book = bookIt.iterateNext()) {
        bible.books[book.getAttribute("num")] = book.getAttribute("filename");
      }
      Tertius.Bibles[bible.abbrev] = bible;
      cb();
    });
  },
  bookXml: function(book, cb) {
    var that = this;
    // We *don't* cache this precisely because we want to avoid large objects in memory
    $.ajax({
      url: "bibles/"+this.books[book],
      dataType: "xml",
      async: false,
      error: function (j, text, error) { console.log("Error "+text);  console.log(j);}
    }).done(function(xml) { xml.abbrev = that.abbrev; cb(xml)});
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
    this.bookXml(book, function (xml) {
      Tertius.BibleSources.splitXml._search.bind(xml)("//book/chapter[@num="+chapter+"]/verse[@num >= "+v1+" and @num <= "+v2+"]", cb);
    });
  },
  search: function(text, cb) {
    for (var b in this.books) {
      this.bookXml(b, function (xml) {
        Tertius.BibleSources.splitXml._search.bind(xml)("//text()[contains(.,'"+text+"')]/ancestor::verse", cb);
      });
    }
    
  }
};
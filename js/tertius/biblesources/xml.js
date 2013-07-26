/* 
XML Bible driver
================

When running Tertius on a desktop browser, one does not have the power of
a SQLite engine available. (Well, there's WebSQL in HTML5 but that only lets
you store up to 5Mb and pre-loading is impossible, so effectively useless
for our purposes.) So for rapid prototyping/development, and also for using
in web environments, there's a second driver for Bible data. This uses
XML files delivered over AJAX, searched using XPath. There's a huge
start-up time particularly when parsing large Bible files, and I don't
want to think about the memory usage, but once it's loaded up it's surprisingly
fast.

Expectations
------------

Oh, it would be lovely to be able to use some kind of standard Bible markup
schema in the XML, but see IMPLEMENTATION.md for why that isn't happening.
Instead, your Bible XML needs to look like this:

  <bible name="King James Version" abbrev="KJV">
    <book num="Gen">
      <chapter num="1">
      <verse num="1">In the beginning God created the heaven and the earth.</verse>
      </chapter>
    </book>
  </bible>

Everything inside a verse tag is displayed as HTML. Yes, that's `<book num="...">`.
Horrible but harmless.

*/

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
      bible.abbrev = bible.documentElement.getAttribute("abbrev");
      Tertius.Bibles[bible.abbrev] = bible;
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
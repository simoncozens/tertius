Tertius.BibleSources.xml = {
  load: function (name) {
    $.ajax({
      url: name+".xml",
      dataType: "xml",
      async: false,
      error: function (j, text, error) { console.log(error); }
    }).done(function (bible) {
      $.extend(bible, Tertius.BibleSources.xml);
      bible.name = bible.documentElement.getAttribute("name");
      Tertius.Bibles[name] = bible;
    });
  },

  lookup: function(book, chapter, v1, v2) {
    var versit = this.evaluate("//bible/book[@num="+book+"]/chapter[@num="+chapter+"]/verse[@num >= "+v1+" and @num <= "+v2+"]", this, null, 0, null);
    var results = [];
    while (verse = versit.iterateNext()) {
      results.push({ reference: chapter+":"+verse.getAttribute("num"), text: verse.textContent });
    }
    return results;
  },

  search: function() {

  }
};
Tertius.BibleSources.xml = {
  load: function (name) {
    $.ajax({
      url: name+".xml",
      dataType: "xml",
      error: function (j, text, error) { console.log(error); }
    }).done(function (bible) {
      $.extend(bible, Tertius.BibleSources.xml);
      Tertius.Bibles[name] = bible;
    });
  },

  lookup: function(book, chapter, verse) {
    var versit = this.evaluate("//bible/book[@num="+book+"]/chapter[@num="+chapter+"]/verse", this, null, 0, null);
    return versit;
  },

  search: function() {

  }
};
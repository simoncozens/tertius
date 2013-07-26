if (!Tertius) Tertius = {};
if (!Tertius.UIs) Tertius.UIs = {};
Tertius.UIs.JQM = {
  mode: "search",
  rebuildBibleMenu: function() {
    $("#versions").empty();
    $("#versions").append('<option data-placeholder="true">Select a Bible version</option>');
    for (var ver in Tertius.Bibles) {
      $("#versions").append("<option name=\""+ver+"\">"+Tertius.Bibles[ver].abbrev+"</option>");
    }
    $("#versions").val([  $("#versions").children().first().next().val() ]);
    $("#versions").selectmenu("refresh");

  },
  currentBibles: function() {
    return $("#versions").val().map(function (x) {return Tertius.Bibles[x]});
  },
  setup: function () {
    var that = this;
    $("#searchbar").keypress(function(e) {
      if(e.which == 13) {
        that.search();
        $("#searchbar").blur();
      }
    });
    $("#searchbar").change(this.search);
    var decorateHack = function() {
      // Decorate the menu items with the name.
      var l = 0;
      var a = $("ul#versions-menu li[data-placeholder!=true] div div a");
      for (var ver in Tertius.Bibles) {
        $(a[l++]).append("<div class=\"bible-fullname\">"+Tertius.Bibles[ver].name+"</div>");
      }
    };

    $("#versions").change(function() {
      decorateHack();
      if (Tertius.state.mode == "search") { that.search(); } else { that.showChapter(); }
    });
    decorateHack();
    this.gotoVerseMode();
    $("#searchButton").click(this.gotoSearchMode);
    $("#verseSelect").click(this.gotoVerseMode);
    $("#nextC").click(this.nextChapter);
    $("#prevC").click(this.prevChapter);

  },
  search: function() {
    Tertius.search($("#searchbar").val());
  },
  gotoSearchMode: function() {
    $("#prevC,#nextC,#verserefbarCont,#searchButton").hide();
    $("#verseSelect,#searchbarCont").show();
    $("#verseSelect").click(this.gotoVerseMode);
    Tertius.state.mode = "search";
  },
  gotoChapter: function() {
    Tertius.state.book = $(this).attr("data-bible-book-osis");
    Tertius.state.chapter = $(this).attr("data-bible-chapter");
    Tertius.UI.showChapter();
  },
  showChapter: function () {
    if (Tertius.state.book && Tertius.state.chapter) {
      Tertius.showChapter();
      $("#verserefbar").val(Tertius.state.book + " " +Tertius.state.chapter);
    }
    $.mobile.changePage("#main");
  },
  nextChapter: function() {
    if (Tertius.state.chapter == BibleRefParser.bookinfo[Tertius.state.book].chapters.length-1) return;
    Tertius.state.chapter++; // Check if it's off the end
    Tertius.UI.showChapter();
  },
  prevChapter: function() {
    if (Tertius.state.chapter == 1) return;
    Tertius.state.chapter--; // Check if it's off the end
    Tertius.UI.showChapter();
  },
  chapterMenuBuilder: function () {
    var book = $(this).attr("data-bible-book-osis");
    $("#verseList").empty();
    var chapters = BibleRefParser.bookinfo[book].chapters;
    for (var i=1; i < chapters.length; i++) {
        var li = $("<li><a>"+i+"</a></li>");
        li.attr("data-bible-book-osis", book);
        li.attr("data-bible-chapter", i);
        $("#verseList").append(li);
    };
    $('#verseList').one('click', 'li', Tertius.UI.gotoChapter);
    $("#verseList").listview("refresh");
  },
  gotoVerseMode: function () {
    var that = this;
    $("#prevC,#nextC,#verserefbarCont,#searchButton").show();
    $("#searchbarCont").hide();
    $("#verseSelect").click(function() {
      $("#verseList").empty();
      for (var bk in BibleRefParser.bookinfo) {
        var li = $("<li><a>"+bk+"</a></li>");
        li.attr("data-bible-book-osis", bk);
        $("#verseList").append(li);
      }
      $('#verseList').one('click', 'li', that.chapterMenuBuilder);
      $("#verseList").listview("refresh");
    });
    Tertius.state.mode = "verse";
  },
  prepareVerseResults: function(i) {
    $("#bible").empty();
    var head= $('<tr class="bibleheader"><td/></tr>');
    Tertius.UI.currentBibles().forEach(function (b) {
      head.append("<th>"+b.abbrev+"</th>");
    });
    $("#bible").append(head);
    var v;
    while ((v = i.next())) {
      var key = v.bookId + "_" + v.chapter + "_" + v.verse;
      var row = $('<tr id="'+key+'"/>');
      row.append('<td>'+v.chapter+":"+v.verse+'</td>');
      Tertius.UI.currentBibles().forEach(function (b) {
        row.append('<td id="'+b.abbrev+"_"+key+'"></td>');
      });
      $("#bible").append(row);
    }
  },
  showBibleResultHandler: function(b, res) {
    res.forEach(function (r) {
      var key = b.abbrev+"_"+r.book + "_" + r.chapter + "_" + r.verse;
      $("#"+key).html(Tertius.processContent(r.content));
    });
  },
  prepareSearchResults: function(t) {
    $("#bible").empty();
  },
  showSearchResultHandler: function(b, res) {
    res.forEach(function (r) {
      var key = r.book + " " + r.chapter + ":" + r.verse;
      $("#bible").append("<tr><th>"+b.abbrev+"</th><th>" + key+ "</th> <td> "+r.content+"</td></tr>");
    });
  }
};
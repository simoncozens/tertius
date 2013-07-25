if (!Tertius) Tertius = {};
if (!Tertius.UIs) Tertius.UIs = {};
Tertius.UIs.JQM = {
  mode: "search",
  rebuildBibleMenu: function() {
    $("#versions").empty();
    $("#versions").append('<option data-placeholder="true">Select a Bible version</option>');
    for (var ver in Tertius.Bibles) {
      $("#versions").append("<option name=\""+ver+"\">"+Tertius.Bibles[ver].name+"</option>");
    }
    $("#versions").val([  $("#versions").children().first().next().val() ]);
    $("#versions").selectmenu("refresh");
  },
  currentBibles: function() {
    return $("#versions").val().map(function (x) {return Tertius.Bibles[x]});
  },
  setup: function () {
    $("#searchbar").keypress(function(e) {
      if(e.which == 13) {
        Tertius.search($("#searchbar").val());
        $("#searchbar").blur();
      }
    });
    $("#searchbar").change(function() { Tertius.search($("#searchbar").val()); });
    $("#versions").change(function() { Tertius.search($("#searchbar").val()); });
    this.gotoVerseMode();
    $("#searchButton").click(this.gotoSearchMode);
    $("#verseSelect").click(this.gotoVerseMode);
  },
  gotoSearchMode: function() {
    $("#prevC,#nextC,#verserefbarCont,#searchButton").hide();
    $("#verseSelect,#searchbarCont").show();
    this.mode = "search";
  },
  gotoVerseMode: function () {
    $("#prevC,#nextC,#verserefbarCont,#searchButton").show();
    $("#searchbarCont").hide();
    this.mode = "verse";
  },
  prepareVerseResults: function(i) {
    $("#bible").empty();
    var head= $('<tr class="bibleheader"><td/></tr>');
    Tertius.UI.currentBibles().forEach(function (b) {
      head.append("<th>"+b.name+"</th>");
    });
    $("#bible").append(head);
    var v;
    while ((v = i.next())) {
      var key = v.bookId + "_" + v.chapter + "_" + v.verse;
      var row = $('<tr id="'+key+'"/>');
      row.append('<td>'+v.chapter+":"+v.verse+'</td>');
      Tertius.UI.currentBibles().forEach(function (b) {
        row.append('<td id="'+b.name+"_"+key+'"></td>');
      });
      $("#bible").append(row);
    }
  },
  showBibleResultHandler: function(b, res) {
    res.forEach(function (r) {
      var key = b.name+"_"+r.book + "_" + r.chapter + "_" + r.verse;
      $("#"+key).html(r.content);
    });
  },
  prepareSearchResults: function(t) {
    $("#bible").empty();
  },
  showSearchResultHandler: function(b, res) {
    res.forEach(function (r) {
      var key = r.book + " " + r.chapter + ":" + r.verse;
      $("#bible").append("<tr><th>"+b.name+"</th><th>" + key+ "</th> <td> "+r.content+"</td></tr>");
    });
  }
};
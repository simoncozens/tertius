Tertius = {
  Bibles: {},
  BibleSources: {},
  setup: function() {
    Tertius.BibleSources.sql.load("net", Tertius.rebuildBibleMenu);
    Tertius.BibleSources.xml.load("shinkyodo", Tertius.rebuildBibleMenu);
    $("#searchbar").keypress(function(e) {
      if(e.which == 13) {
        Tertius.search();
      }
    });
  },
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
  search: function() {
    var ref = $("#searchbar").val();
    $("#bible").empty();
    var iterators = [];
    var bibleRef = BibleRefParser(ref);
    var head= $('<tr class="bibleheader"><td/></tr>');
    this.currentBibles().forEach(function (b) {
      head.append("<th>"+b.name+"</th>");
    });
    $("#bible").append(head);
    if (bibleRef) {
      return this.showBible(bibleRef);
    }
    // It's a word search
  },
  showBible: function(ref) {
    // Prepare rows to receive results
    var i = ref.iterator();
    var v;
    while ((v = i.next())) {
      var key = v.bookId + "_" + v.chapter + "_" + v.verse; // XXX Should be OSIS
      var row = $('<tr id="'+key+'"/>');
      row.append('<td>'+v.chapter+":"+v.verse+'</td>');
      Tertius.currentBibles().forEach(function (b) {
        row.append('<td id="'+b.name+"_"+key+'"></td>');
      });
      $("#bible").append(row);
    }
    ref.references.forEach( function(r) {
      Tertius.currentBibles().forEach(function (b) {
        b.lookup(r.bookId, r.chapter, r.startVerse, r.endVerse, Tertius.showBibleResultHandler);
      });
    });
  },
  showBibleResultHandler: function(b, res) {
    console.log(b);
    console.log("Name :" + b.name);
    res.forEach(function (r) {
      // Find cell for this reference
      var key = b.name+"_"+r.book + "_" + r.chapter + "_" + r.verse;
      console.log(key);
      $("#"+key).html(r.content);
    });
  },

};

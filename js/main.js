Tertius = {
  Bibles: {},
  BibleSources: {},
  setup: function() {
    $.mobile.loading( "show" );
    Tertius.BibleSources.xml.load("net");
    Tertius.BibleSources.xml.load("shinkyodo");
    $("#versions").empty();
    $("#versions").append('<option data-placeholder="true">Select a Bible version</option>');
    for (var ver in Tertius.Bibles) {
      $("#versions").append("<option name=\""+ver+"\">"+Tertius.Bibles[ver].name+"</option>");
    }
    $("#versions").val([  $("#versions").children().first().next().val() ]);
    $("#versions").selectmenu("refresh");
    $("#searchbar").keypress(function(e) {
      if(e.which == 13) {
        Tertius.search();
      }
    });
    $.mobile.loading( "hide" );
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
    /* For efficient searching we are going to get all the verse information 
    for each passage from a given source in one go, then fit it together later, 
      rather than iterating each verse in each source. */
    var results= {};
    ref.references.forEach( function(r) {
      var order = [];
      var thisref;
      Tertius.currentBibles().forEach(function (b) {
        b.lookup(r.bookId, r.chapter, r.startVerse, r.endVerse).forEach(function (verse) {
          if (!results[verse.reference]) {
            results[verse.reference] = {};
            order.push(verse.reference);
          }
          results[verse.reference][b.name] = verse.text;
        });
      });

      order.forEach( function(r) {
        var row = $('<tr><th class="ref">'+r+"</th></tr>");
        Tertius.currentBibles().forEach(function (b) {
          v = results[r][b.name];
          var td = $("<td>"); td.append(v);
          row.append(td);
        });
        $("#bible").append(row);

      });


    });
  },

};

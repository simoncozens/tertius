Tertius = {
  Bibles: {},
  BibleSources: {},
	setup: function() {
    Tertius.BibleSources.xml.load("net");
    Tertius.BibleSources.xml.load("shinkyodo");
		$("#searchbar").keypress(function(e) {
      if(e.which == 13) {
        Tertius.search();
      }
    });
	},
  search: function() {
    var ref = $("#searchbar").val();
    $("#bible").empty();
    this.currentBibles = [ Tertius.Bibles.net, Tertius.Bibles.shinkyodo ];
    var iterators = [];
    var bibleRef = BibleRefParser(ref);
    var head= $('<tr class="bibleheader"><td/></tr>');
    this.currentBibles.forEach(function (b) {
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
    var order = [];
    ref.references.forEach( function(r) {
      var thisref;
      Tertius.currentBibles.forEach(function (b) {
        b.lookup(r.bookId, r.chapter, r.startVerse, r.endVerse).forEach(function (verse) {
          if (!results[verse.reference]) {
            results[verse.reference] = {};
            order.push(verse.reference);
          }
          results[verse.reference][b.name] = verse.text;
        });
      });
    });
    order.forEach( function(r) {
      var row = $('<tr><th class="ref">'+r+"</th></tr>");
      console.log(results[r]);
      Tertius.currentBibles.forEach(function (b) {
        v = results[r][b.name];
        var td = $("<td>"); td.append(v);
        row.append(td);
      });
      $("#bible").append(row);

    });
  },

};

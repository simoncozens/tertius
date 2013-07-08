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
    var ref = $("#searchbar").val().split(/ /);
    $("#bible").empty();
    var currentBibles = [ Tertius.Bibles.net, Tertius.Bibles.shinkyodo ];
    var iterators = [];
    var head= $('<tr class="bibleheader"><td/></tr>');
    currentBibles.forEach(function (b) {
      iterators.push(b.lookup(ref[0], ref[1],ref[2]));
      head.append("<th>"+b.documentElement.getAttribute("name")+"</th>");
    });
    $("#bible").append(head);
    var nonempty = iterators.length;
    while (nonempty > 0) {
      var verses = [];
      var nonempty = 0;
      iterators.forEach(function(i) {
        var verse;
        if (verse = i.iterateNext()) {
          verses.push(verse);
          nonempty++;
        }
      });
      if (verses.length > 0) {
        var row = $("<tr><th>"+verses[0].getAttribute("num")+"</th></tr>");
        verses.forEach(function (v) {
          var td = $("<td>"); td.append(v.textContent);        
          row.append(td);
        });
        $("#bible").append(row);
      }
    }
  },

};

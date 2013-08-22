if (!Tertius) Tertius = {};
if (!Tertius.UIs) Tertius.UIs = {};
Tertius.UIs.JQM = {
  mode: "search",
  mobileInit: function () {
    $.mobile.autoInitialize = false;
  },
  start: function()  { 
    $.mobile.initializePage();
    Tertius.setup();
    $.mobile.hidePageLoadingMsg();
  },
  rebuildBibleMenu: function() {
    $("#versions").empty();
    $("#versions").append('<option data-placeholder="true">Select a Bible version</option>');
    for (var ver in Tertius.Bibles) {
      $("#versions").append("<option name=\""+ver+"\">"+Tertius.Bibles[ver].abbrev+"</option>");
    }
    $("#versions").val([  $("#versions").children().first().next().val() ]);
    $("#versions").selectmenu("refresh");
    this.decorateHack();
  },
  currentBibles: function() {
    return $("#versions").val().map(function (x) {return Tertius.Bibles[x]});
  },
  setCurrentBibles: function(babbrevs) {
    $("#versions").val(babbrevs);
    $("#versions").selectmenu("refresh");
  },
  decorateHack: function() {
      // Decorate the menu items with the name.
      var l = 0;
      var a = $("ul#versions-menu li[data-placeholder!=true] div div a");
      for (var ver in Tertius.Bibles) {
        $(a[l++]).append("<div class=\"bible-fullname\">"+Tertius.Bibles[ver].name+"</div>");
      }
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

    $("#versions").change(function() {
      that.decorateHack();
      if (Tertius.state.mode == "search") { that.search(); } else { that.showChapter(); }
    });
    this.gotoVerseMode();
    $("#searchButton").click(this.gotoSearchMode);
    $("#verseSelect").click(this.gotoVerseMode);
    $("#nextC").click(this.nextChapter);
    $("#prevC").click(this.prevChapter);
    $("#bible").on("click", "a[data-role=popup-trigger]", function(){
      $("#"+($(this).data("popup-id"))).popup("open");
    });
    $.event.special.swipe.verticalDistanceThreshold = 30;
    $.event.special.swipe.horizontalDistanceThreshold = 30;
    $("#bible").on("swipeleft", function() {if (Tertius.state.mode == "verse") {that.nextChapter(); } });
    $("#bible").on("swiperight", function() {if (Tertius.state.mode == "verse") {that.prevChapter(); } });
    $("#history").click(function() { Tertius.HistoryAndBookmarks.show("history"); });
    $("#bookmarks").click(function() { Tertius.HistoryAndBookmarks.show("bookmarks"); });
    $("#save-bookmark").click(function() {
      Tertius.HistoryAndBookmarks.select("bookmarks", -1);
      $("#bookmarksMenu").popup("close");
    });
    this.setupBibleReadingPlansList();
    $("#settings-save").click(this.saveSettings);
    $("#settings-cancel").click(function() { $("#settingsDlg").dialog("close"); });
    $("#settingsDlg").on('pageinit', this.copySettingsToUI);
    this.applySettings();
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
    if (Tertius.state.chapter == Tertius.bcv.translations.default.chapters[Tertius.state.book].length-1) return;
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
    var chapters = Tertius.bcv.translations.default.chapters[book];
    for (var i=1; i < chapters.length; i++) {
        var li = $("<li><a>"+i+"</a></li>");
        li.attr("data-bible-book-osis", book);
        li.attr("data-bible-chapter", i);
        $("#verseList").append(li);
    }
    $('#verseList').one('click', 'li', Tertius.UI.gotoChapter);
    $("#verseList").listview("refresh");
  },
  gotoVerseMode: function () {
    $("#prevC,#nextC,#verserefbarCont,#searchButton").show();
    $("#searchbarCont").hide();
    $("#verseSelect").click(Tertius.UI.verseSelectClick);
    Tertius.state.mode = "verse";
  },
  verseSelectClick: function() {
    $("#verseList").empty();
    for (var bk in Tertius.bcv.translations.default.chapters) {
      var li = $("<li><a>"+bk+"</a></li>");
      li.attr("data-bible-book-osis", bk);
      $("#verseList").append(li);
    }
    $('#verseList').one('click', 'li', Tertius.UI.chapterMenuBuilder);
    $("#verseList").listview("refresh");
  },
  prepareVerseResults: function(i) {
    Tertius.UI.preprocessResults();
    var head= $('<tr class="bibleheader"></tr>');
    if (Tertius.SettingsManager.settings.presentation == "parallel") {
      head.append("<td/>");
      Tertius.UI.currentBibles().forEach(function (b) {
        head.append("<th>"+b.abbrev+"</th>");
      });
    }
    $("#bible").append(head);
    var v;
    while ((v = i.next())) {
      var key = v.replace(/\./g,"_");
      var mo = v.match(/(\w+)\.(\d+)\.(\d+)/);
      var row;
      row = "<tbody>";
      if (Tertius.SettingsManager.settings.presentation == "parallel") {
        row += '<tr id="'+key+'"><td>'+mo[2]+":"+mo[3]+'</td>';
      } else {
        row += '<tr id="'+key+'"><td rowspan="'+Tertius.UI.currentBibles().length+'">'+mo[2]+":"+mo[3]+'</td>';
      }
      Tertius.UI.currentBibles().forEach(function (b) {
        if (Tertius.SettingsManager.settings.presentation == "interlinear") {
          row += '<th>'+b.abbrev+'</th>';
        }
        row += '<td id="'+b.abbrev+"_"+key+'"></td>';
        if (Tertius.SettingsManager.settings.presentation == "interlinear") {
          row += "</tr><tr>"
        }
      });
      row += "</tr></tbody>";
      $("#bible").append(row);
    }
  },
  showBibleResultHandler: function(b, res) {
    for (var i =0; i < res.length; i++) {
      var r = res[i];
      var key = b.abbrev+"_"+r.book + "_" + r.chapter + "_" + r.verse;
      $("#"+key).html(r.content);
    }
    Tertius.UI.postprocessResults();
  },
  showSearchResultHandler: function(b, res) {
    for (var i =0; i < res.length; i++) {
      var r = res[i];
      var key = r.book + " " + r.chapter + ":" + r.verse;
      $("#bible").append("<tr><th>"+b.abbrev+"</th><th>" + key+ "</th> <td> "+r.content+"</td></tr>");
    }
    Tertius.UI.postprocessResults();
  },
  prepareSearchResults: function(t){
    Tertius.UI.preprocessResults();
  },
  preprocessResults: function() {
    $("#bible").empty();
    $("div.footnote").remove();

  },
  postprocessResults: function() {
    var footnoteRef = 0;
    $("note").replaceWith(function() {
      var note = $("<p></p>").append(this.innerHTML);
      footnoteRef++;
      var popup = $('<div class=\"footnote\" data-role=\"popup\" data-overlay-theme="a" id=\"popup-'+footnoteRef+'\" data-tolerance="15">').append(note);
      return $("<span><a data-role=\"popup-trigger\" data-popup-id=\"popup-"+footnoteRef+"\"> <sup>"+footnoteRef+"</sup> </a></span>").append(popup);
    });
    $("div.footnote").popup().trigger("create");

    $("w[pos!=X-]").click(function() {
      $("#morphWord").html($(this).clone());
      $("#morphText").html(Tertius.Morphology.Greek.explain(this));
      $("#morphPopup").popup("open");
    });
  },
  showHistoryBookmarks: function (actingAs, list) {
    console.log("Hitme "+actingAs);
    var popup = $("#"+actingAs+"Menu");
    var listview = popup.find("ul");
    listview.find("li[data-role!=divider]").remove();
    list.forEach(function(li, id) {
      console.log("Adding "+li);
      var item = $("<li>"+li+"</li>");
      item.click(function() { 
        Tertius.HistoryAndBookmarks.select(actingAs, id);
        popup.popup("close");
      });
      listview.append(item);
    });
    listview.listview("refresh");
    setTimeout(function () { popup.popup("open") },1);
  },
  setupBibleReadingPlansList: function() {
    if (!Tertius.BibleReading.plans || Object.keys(Tertius.BibleReading.plans).length == 0) return;
    $("#settings-table").append('<tr><td><label for="setting-bibleReadingPlan">Bible Reading Plan:</label></td><td><select id="setting-bibleReadingPlan" name="setting-bibleReadingPlan" data-inline="true" data-native-menu="false"/></td></tr>')
    $("#setting-bibleReadingPlan").empty();
    for (var plan in Tertius.BibleReading.plans) {
      $("#setting-bibleReadingPlan").append("<option value=\""+plan+"\">"+Tertius.BibleReading.plans[plan].info+"</option>");
    }
    $("#setting-bibleReadingPlan").val([  $("#setting-bibleReadingPlan").children().first().val() ]);
    if (!Tertius.SettingsManager.settings.bibleReadingPlan) Tertius.SettingsManager.settings.bibleReadingPlan = $("#setting-bibleReadingPlan").val();
    if ($("#setting-bibleReadingPlan").data("mobileSelectmenu")) {$("#setting-bibleReadingPlan").selectmenu("refresh", true); } else {$("#setting-bibleReadingPlan").trigger("create"); }

    $("#footerbar").append('<a href="#" data-role="button" data-inline="true" id="dailyreading" data-icon="calendar" data-iconpos="notext">Daily Reading</a>');
    $("#dailyreading").button().click(Tertius.BibleReading.todaysReading);
  },
  copySettingsToUI: function() {
    for (var k in Tertius.SettingsManager.settings) { 
      var v = Tertius.SettingsManager.settings[k];
      $("#setting-"+k).val(v);
      console.log("Setting "+k+" to "+v);
    }
    $("#settingsDlg * input[data-type=range],#settingsDlg * [data-role=slider]").slider("refresh");
    $("#settingsDlg * select[data-native-menu=false]").selectmenu("refresh");
    $("div.ui-slider").last().width("120px");
  },
  copySettingsFromUI: function() {
    for (var k in Tertius.SettingsManager.settings) { 
      Tertius.SettingsManager.settings[k] = $("#setting-"+k).val();
    }
  },
  saveSettings: function() {
    Tertius.UI.copySettingsFromUI();
    Tertius.SettingsManager.save();
    Tertius.UI.applySettings();
  },
  applySettings: function() {
    try { $("#settingsDlg").dialog("close"); } catch(e) {console.log(e); }
    $("#bible").css("font-size", Tertius.SettingsManager.settings.fontSize+"%");
    if (Tertius.SettingsManager.settings.ruby == "0") { $("body").addClass("ruby-hidden") } else { $("body").removeClass("ruby-hidden") }
  }
};

$('div[data-role=dialog]').on('pagebeforeshow', function(e, ui) {
ui.prevPage.addClass("ui-dialog-background ");
});
$('div[data-role=dialog]').on('pagehide', function(e, ui) {
  $(".ui-dialog-background ").removeClass("ui-dialog-background ");
});

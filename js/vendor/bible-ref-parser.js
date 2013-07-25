// A Bible reference parser, by Simon Cozens <simon@simon-cozens.org>
// Inspired by (and stealing a bit of data from) Jason Wall (Jason@walljm.com // www.walljm.com)

/*
The MIT License (MIT)

Copyright (c) 2013 Simon Cozens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

BibleRefParser = function(ref, uOptions) {
  var options = { lang: "en" };
  if (uOptions) {
    for (var key in uOptions) { options[key] = uOptions[key]; }
  }
  var context = {
    bookId: 0
  };

  var result = {references: []};
  // Prototype only works on objects, fake it:
  for (var key in BibleRefParser.resultMethods) { result[key] = BibleRefParser.resultMethods[key]; }

  var addRange = function(c, v1, v2) {
    c = parseInt(c, 10); v1 = parseInt(v1, 10); v2 = parseInt(v2, 10);
    var book = BibleRefParser.bookinfo[context.bookId];
    if (!v1) { v1 = 1; }
    if (!v2) { v2 = book.chapters[c]; }
    context.chapter = c;
    result.references.push({
      bookId: context.bookId,
      chapter: c,
      startVerse: v1,
      endVerse: v2
    });
  };

  var addMultiRange = function(c1, v1, c2, v2) {
    c1 = parseInt(c1, 10); v1 = parseInt(v1, 10);
    c2 = parseInt(c2, 10); v2 = parseInt(v2, 10);
    while (c1 <= c2) {
      if (c1 == c2) {
        addRange(c1, v1, v2);
        return;
      } else {
        addRange(c1, v1); // From here until the end of the chapter
        // And now start again at the beginning of the next chapter
        c1++;
        v1 = 1;
      }
    }
  };

  // Set up RE list
  if (!BibleRefParser.bookinfo["Gen"].regexps[options.lang]) {
    throw "Unknown language "+options.lang;
  }

  while (ref.match(/\S/)) {
    // Trim off leading space
    ref = ref.replace(/^\s+/,"");
    // Look for a book name
    for (var bk in BibleRefParser.bookinfo) {
      if (ref.match(BibleRefParser.bookinfo[bk].regexps[options.lang])) {
        context.bookId = bk;
        ref = ref.replace(BibleRefParser.bookinfo[bk].regexps[options.lang], "");
        break;
      }
    }

    // If we didn't see a book name and we have no context, this reference is junk
    if (!context["bookId"]) {
      throw("Unparsable reference");
    }

    // Longest match case: ChA:VV-ChB:VV
    var mo = ref.match(/^[\s\.,;]*(\d+):(\d+)-(\d+):(\d+)\s*/);
    if (mo) {
      addMultiRange(mo[1],mo[2],mo[3],mo[4]);
      ref = ref.replace(/^[\s\.,;]*(\d+):(\d+)-(\d+):(\d+)\s*/,"");
      continue;
    }

    // Next longest match case: ChA:XX-YY
    mo = ref.match(/^[\s\.,;]*(\d+):(\d+)-(\d+)\s*/);
    if (mo) {
      addRange(mo[1],mo[2],mo[3]);
      ref = ref.replace(/^[\s\.,;]*(\d+):(\d+)-(\d+)\s*/,"");
      continue;
    }

    // Next longest match case: ChA:XX[-|ff.|etc]
    mo = ref.match(/^[\s\.,;]*(\d+):(\d+)(-|ff?.?)\s*/);
    if (mo) {
      addRange(mo[1],mo[2]);
      ref = ref.replace(/^[\s\.,;]*(\d+):(\d+)(-|ff?.?)\s*/,"");
      continue;
    }

    // Next longest match case: ChA:XX
    mo = ref.match(/^[\s\.,;]*(\d+):(\d+)\s*/);
    if (mo) {
      addRange(mo[1],mo[2],mo[2]);
      ref = ref.replace(/^[\s\.,;]*(\d+):(\d+)\s*/,"");
      continue;
    }

    // Next longest match case: ChA
    mo = ref.match(/^[\s\.]*(\d+)\s*/);
    if (mo) {
      addRange(mo[1],1);
      ref = ref.replace(/^[\s\.,;]*(\d+)\s*/,"");
      continue;
    }

    // A chapter after a semicolon
    mo = ref.match(/^;\s*(\d+)\s*/);
    if (mo) {
      addRange(mo[1]);
      ref = ref.replace(/^;\s*(\d+)\s*/,"");
      continue;
    }

    // A verse after a comma
    mo = ref.match(/^,\s*(\d+)\s*/);
    if (mo) {
      if (!context.chapter) { throw("Unparsable reference"); }
      addRange(context.chapter,mo[1],mo[1]);
      ref = ref.replace(/^,\s*(\d+)\s*/,"");
      continue;
    }
    // Other punctuation and space junk
    if (ref.match(/^[\s\.,;:]+/)) {
      ref = ref.replace(/^[\s\.,;:]+/,"");
      continue;
    }
    // We should not be here
    if(options.strict) {
      throw("Junk at end of reference");
    } else {
      return result;
    }
  }
  return result;
};


BibleRefParser.resultMethods = {
  iterator: function () {
    var i = { refPtr: 0, versePtr: 0, references: this.references };
    i.next = function() {
      var ref = this.references[this.refPtr];
      if (!ref) return;
      if (this.versePtr === 0) this.versePtr = ref.startVerse;
      var v = { bookId: ref.bookId, chapter: ref.chapter, verse: this.versePtr};
      this.versePtr++;
      if (this.versePtr > ref.endVerse) {
        // Go to next reference in chain
        this.refPtr++; this.versePtr = 0;
      }
      return v;
    };
    return i;
  }
};
BibleRefParser.bookinfo = {
  Gen: 
   { chapters:  [ 0, 31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26 ],
     regexps: { en: /^(ge(n(esis)?)?|gn)\b/i } },
  Exod: 
   { chapters:  [ 0, 22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38 ],
     regexps: { en: /^(ex(o(d(us)?)?)?|exd)\b/i } },
  Lev: 
   { chapters:  [ 0, 17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34 ],
     regexps: { en: /^(le(v(i(ticus)?)?)?|lv)\b/i } },
  Num: 
   { chapters:  [ 0, 54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13 ],
     regexps: { en: /^(nu(m(b(ers?)?)?)?)\b/i } },
  Deut: 
   { chapters:  [ 0, 46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12 ],
     regexps: { en: /^(de(u(t(eronomy)?)?)?|dt)\b/i } },
  Josh: 
   { chapters:  [ 0, 18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33 ],
     regexps: { en: /^(jos(h(ua)?)?)\b/i } },
  Judg: 
   { chapters:  [ 0, 36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25 ],
     regexps: { en: /^j(dg|ud(ges|g)?|u)\b/i } },
  Ruth: 
   { chapters: [ 0, 22, 23, 18, 22 ],
     regexps: { en: /^ru(th)?\b/i } },
  '1Sam': 
   { chapters:  [ 0, 28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13 ],
     regexps: { en: /^(1st|first|[1i])\s*s(am(uel)?|ml|a)\b/i } },
  '2Sam': 
   { chapters:  [ 0, 27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25 ],
     regexps: { en: /^(2nd|ii|sec(ond)?|2)\s*s(am(uel)?|ml|a)\b/i } },
  '1Kgs': 
   { chapters:  [ 0, 53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53 ],
     regexps: { en: /^(1st|first|[1i])\s*k(gs|ings?|[in])?\b/i } },
  '2Kgs': 
   { chapters:  [ 0, 18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30 ],
     regexps: { en: /^(2nd|ii|sec(ond)?|2)\s*k(gs|ings?|[in])?\b/i } },
  '1Chr': 
   { chapters:  [ 0, 54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30 ],
     regexps: { en: /^(1st|first|[1i])\s*ch(ron(icles)?|r)?\b/i } },
  '2Chr': 
   { chapters:  [ 0, 17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23 ],
     regexps: { en: /^(1st|first|[1i])\s*ch(ron(icles)?|r)?\b/i } },
  Ezra: 
   { chapters: [ 0, 11, 70, 13, 24, 17, 22, 28, 36, 15, 44 ],
     regexps: { en: /^ez(ra|r)?\b/i } },
  Neh: 
   { chapters: [ 0, 11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31 ],
     regexps: { en: /^ne(h[ae]miah|h)?\b/i } },
  Esth: 
   { chapters: [ 0, 22, 23, 15, 17, 14, 14, 10, 17, 32, 3 ],
     regexps: { en: /^es(th(er)?|t)?\b/i } },
  Job: 
   { chapters:  [ 0, 22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17 ],
     regexps: { en: /^j(ob|[bo])\b/i } },
  Ps: 
   { chapters:  [ 0, 6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6 ],
     regexps: { en: /^ps(alms?|[am])?\b/i } },
  Prov: 
   { chapters:  [ 0, 33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31 ],
     regexps: { en: /^pr(ov(erbs?)?|vbs|[ov])?\b/i } },
  Eccl: 
   { chapters: [ 0, 18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14 ],
     regexps: { en: /^ec(cl(es(iastes?)?)?|[cl])?\b/i } },
  Song: 
   { chapters: [ 0, 17, 17, 11, 16, 16, 13, 13, 14 ],
     regexps: { en: /^(song\sof\ssolomon|song\sof\ssongs|sos|ss|son|so|song|songs)\b/i } },
  Isa: 
   { chapters:  [ 0, 31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24 ],
     regexps: { en: /^i(sa(iah|[hi])|[as])\b/i } },
  Jer: 
   { chapters:  [ 0, 19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34 ],
     regexps: { en: /^je(r(emiah|imiah|e)|r)?\b/i } },
  Lam: 
   { chapters: [ 0, 22, 22, 66, 22, 22 ],
     regexps: { en: /^la(mentations?|m)?\b/i } },
  Ezek: 
   { chapters:  [ 0, 28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35 ],
     regexps: { en: /^ez(ek(iel)?|[ek])?\b/i } },
  Dan: 
   { chapters: [ 0, 21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13 ],
     regexps: { en: /^d(an(iel)?|[aln])\b/i } },
  Hos: 
   { chapters: [ 0, 11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9 ],
     regexps: { en: /^ho(sea|s)?\b/i } },
  Joel: 
   { chapters: [ 0, 20, 32, 21 ],
     regexps: { en: /^j(oel?|l)\b/i } },
  Amos: 
   { chapters: [ 0, 15, 16, 15, 13, 27, 14, 17, 14, 15 ],
     regexps: { en: /^am(os|o)?\b/i } },
  Obad: { chapters: [ 0, 21 ], regexps: { en: /^ob(ad(iah)?|a)?\b/i } },
  Jonah: 
   { chapters: [ 0, 16, 10, 10, 11 ],
     regexps: { en: /^j(nh|on(ah)?)\b/i } },
  Mic: 
   { chapters: [ 0, 16, 13, 12, 13, 15, 16, 20 ],
     regexps: { en: /^mi(cah|c)?\b/i } },
  Nah: 
   { chapters: [ 0, 15, 13, 19 ],
     regexps: { en: /^na(hum|h)?\b/i } },
  Hab: 
   { chapters: [ 0, 17, 20, 19 ],
     regexps: { en: /^ha(bakk?uk|b)?\b/i } },
  Zeph: 
   { chapters: [ 0, 18, 15, 20 ],
     regexps: { en: /^zep(haniah|h)?\b/i } },
  Hag: 
   { chapters: [ 0, 15, 23 ],
     regexps: { en: /^h(ag(g(ai|ia))?|g)\b/i } },
  Zech: 
   { chapters: [ 0, 21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21 ],
     regexps: { en: /^z(ch|ec(hariah|h)?)\b/i } },
  Mal: 
   { chapters: [ 0, 14, 17, 18, 6 ],
     regexps: { en: /^mal(achi)?\b/i } },
  Matt: 
   { chapters:  [ 0, 25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20 ],
     regexps: { en: /^m(at(thew|t)?|t)\b/i } },
  Mark: 
   { chapters: [ 0, 45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20 ],
     regexps: { en: /^m(ark|rk|[kr])\b/i } },
  Luke: 
   { chapters:  [ 0, 80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53 ],
     regexps: { en: /^l(ke|uke?|[ku])\b/i } },
  John: 
   { chapters:  [ 0, 51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25 ],
     regexps: { en: /^j(oh|h)?n\b/i } },
  Acts: 
   { chapters:  [ 0, 26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31 ],
     regexps: { en: /^ac(ts|t)?\b/i } },
  Rom: 
   { chapters: [ 0, 32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27 ],
     regexps: { en: /^r(om(ans?)?|[mo])\b/i } },
  '1Cor': 
   { chapters: [ 0, 31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24 ],
     regexps: { en: /^(1st|first|[1i])\s*co(rin(th(ians?)?|t)?|th)?\b/i } },
  '2Cor': 
   { chapters: [ 0, 24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13 ],
     regexps: { en: /^(2nd|ii|sec(ond)?|2)\s*co(rin(th(ians?)?|t)?|th)?\b/i } },
  Gal: 
   { chapters: [ 0, 24, 21, 29, 31, 26, 18 ],
     regexps: { en: /^ga(la(ti(ans?|ons?)|t)?|l)?\b/i } },
  Eph: 
   { chapters: [ 0, 23, 22, 21, 32, 33, 24 ],
     regexps: { en: /^ep(h(es(ians)?|[es])|h)?\b/i } },
  Phil: 
   { chapters: [ 0, 30, 30, 21, 23 ],
     regexps: { en: /^ph(il(ip(pians)?)?|i)?\b/i } },
  Col: 
   { chapters: [ 0, 29, 23, 25, 18 ],
     regexps: { en: /^co(los(sians?|s)?|l)?\b/i } },
  '1Thess': 
   { chapters: [ 0, 10, 20, 13, 18, 28 ],
     regexps: { en: /^(1st|first|[1i])\s*th(es(sa(lonians?)?|s)?|e)?\b/i } },
  '2Thess': 
   { chapters: [ 0, 12, 17, 18 ],
     regexps: { en: /^(2nd|ii|sec(ond)?|2)\s*th(es(sa(lonians?)?|s)?|e)?\b/i } },
  '1Tim': 
   { chapters: [ 0, 20, 15, 16, 16, 25, 21 ],
     regexps: { en: /^(1st|first|[1i])\s*t(im(othy?)?|[im])\b/i } },
  '2Tim': 
   { chapters: [ 0, 18, 26, 17, 22 ],
     regexps: { en: /^(2nd|ii|sec(ond)?|2)\s*t(im(othy?)?|m)\b/i } },
  Titus: { chapters: [ 0, 16, 15, 15 ], regexps: { en: /^tit(us)?\b/i } },
  Phlm: 
   { chapters: [ 0, 25 ],
     regexps: { en: /^ph(ile(mon|m)?|lmn|[lm])\b/i } },
  Heb: 
   { chapters: [ 0, 14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25 ],
     regexps: { en: /^he(brews?|b)?\b/i } },
  Jas: 
   { chapters: [ 0, 27, 26, 18, 17, 20 ],
     regexps: { en: /^j(a(mes?|[ms])|ms|[am])\b/i } },
  '1Pet': 
   { chapters: [ 0, 25, 25, 22, 19, 14 ],
     regexps: { en: /^(1st|first|[1i])\s*p(et(er|e)?|[et])?\b/i } },
  '2Pet': 
   { chapters: [ 0, 21, 22, 18 ],
     regexps: { en: /^(2nd|ii|sec(ond)?|2)\s*p(et(er|e)?|[et])?\b/i } },
  '1John': 
   { chapters: [ 0, 10, 29, 24, 21, 21 ],
     regexps: { en: /^(1st|first|[1i])\s*j(ohn|[no])\b/i } },
  '2John': 
   { chapters: [ 0, 13 ],
     regexps: { en: /^(2nd|ii|sec(ond)?|2)\s*j(ohn|[no])\b/i } },
  '3John': 
   { chapters: [ 0, 15 ],
     regexps: { en: /^(3rd|iii|third|3)\s*j(ohn|[no])\b/i } },
  Jude: 
   { chapters: [ 0, 25 ],
     regexps: { en: /^(3rd|iii|third|3)\s*j(ohn|[no])\b/i } },
  Rev: 
   { chapters:  [ 0, 20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 18, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21 ],
     regexps: { en: /^r(ev(elations?)?|[ev])\b/i } } 
};

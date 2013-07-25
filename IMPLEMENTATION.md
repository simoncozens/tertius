Some Implementation Notes
=========================

Doing it right versus doing it now
----------------------------------

Tertius is designed as a library for making web-based Bible reading apps. The
initial use case for Tertius was a Bible study application for mobile devices:
make a web app, bundle it with Phonegap, job done. But how do we get Bible
data into the application? My thoughts were a) store all the Bible data in an
SQLite database (this is what most mobile Bible apps do), taking advantage of
SQLite's quick retrieval and full-text searching capabilities, but also b)
write a data access abstraction layer (always a good idea), and create a
module to support Bibles in XML format for rapid prototyping. Prototyping of
web apps is best done in the browser, and browsers speak XML and give you
XPath selection for free. It's slow, but hey, we're prototyping.

But anytime you use XML to solve a problem, you have another problem: whose
schema do you use? Initially I targetted "this random schema I just cooked
up", which works, but aesthetically doesn't satisfy. I looked around and found
that [OSIS](http://www.bibletechnologies.net/), bent though it is, seems to be
the best of breed at the moment, so I thought maybe I'd support that (and punt
the text-searching problem until later - XPath FTS seems to be at the
"wishful thinking" phase of standards implementation).

Now the OSIS manual makes a very good case against the traditional,
hierarchical chapter-and-verse structure to Bible texts. Retaining paragraph
and other super-structure information makes a lot of sense, and is clearly the
Right Thing to do.

Except:

* Selecting a bunch of nodes forming a given passage from the tag-soup mess
  that is milestoned OSIS is a pain in the neck; which would be bearable were
  it not for the fact that
* Aligning multiple versions, possibly with different paragraph divisions,
  against each other is a total pain in the neck; which would be bearable were
  it not for the fact that
* Overlapping tag-soup texts really can't be serialised into anything more sensible
  and so you're forced into sticking to dealing directly with the XML; which would be
  bearable were it not for the fact that
* Full-text searching in XML texts is still a problem we punted on; which would be solved
  with something like [`lunr.js`](http://lunrjs.com/) were it not for the fact that
* Futzing with multi-megabyte XML texts in a memory-restricted Javascript environment
  [turns out to be a bad idea](http://sealedabstract.com/rants/why-mobile-web-apps-are-slow/)

So OSIS, you're fantastic, you're clearly the right thing to support, but you
know what? I'm going to stick to chapter-and-verse for now, which avoids all of
the above problems.

Full-text search
----------------

Similarly, doing FTS right is a pig, especially in a multi-lingual environment.
The Right Thing for Japanese FTS is to use language aware stemming parser (of which the
only one worth talking about is MeCab) or an n-gram tokenizer. N-gram tokenizers are
less hellish to implement but I haven't seen a decent implementation either for
SQLite or lunr. MeCab is the best solution but is a big and difficult to manage
dependency.

iOS builds of SQLite don't include FTS support. That's a big pain. 
[This project](https://github.com/dominikkrejcik/sqliteFTSTest) shows how to link
against a FTS-enabled SQLite, but that only gets you the porter and simple tokenizers,
neither of which are any good for non-Latin languages. Trying to enable ICU doesn't
help because iOS doesn't have enough of the ICU library. (In particular the break
support, which is what tokenizing is all about.)

What have we got left? Lunr.js and make your own n-gram tokenizer? Not much fun.
S4LuceneLibrary? Doesn't support the CJK tokenizer. Back to Mecab, eh?

https://github.com/FLCLjp/iPhone-libmecab is a mecab implementation for iOS. (We're
punting on Android for now.) Tying this into SQLite is quite painful, and even if we
did, dictionary files are huge.
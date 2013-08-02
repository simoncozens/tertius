Tertius.Morphology = {}
Tertius.Morphology.Greek = {
	pos: { "A-": "Auxilliary", 
			"C-": "Conjunction",
			"D-": "Adverb",
			"I-": "Interjection",
			"N-": "Noun",
			"P-": "Preposition",
			"RA": "Article",
			"RD": "Pronoun (demonstrative)",
			"RI": "Pronoun (interrogative)",
			"RP": "Pronoun (personal)",
			"RR": "Article",
			"V-": "Verb",
		},
	person: { 1: "1st", 2: "2nd", 3: "3rd" },
	tense: { A: "Aorist", F:"Future", P: "Present", I:"Imperfect", Y: "Pluperfect", X:"Perfect" },
	voice: { A: "Active", M: "Middle", P:"Passive"},
	mood: { I: "Indicative", N: "Infinitive", O: "Optative", D: "Imperative", S:"Subjunctive", P:"Participal"},
	case: { N: "Nominative", G: "Genitive", D: "Dative", V: "Vocative", A: "Accusative"},
	number: {S: "Singular", P: "Plural" },
	explain: function(w) {
		w=$(w);
		var morph;
		var t = $("<table>");
		t.append("<tr><th>Part of speech</th><td>"+ this.pos[w.attr("pos")]+"</td></tr>");
		if ((morph = w.attr("morph"))) {
			var tags = morph.split("");
			if (this.person[tags[0]]) { t.append("<tr><th>Person</th><td>"+ this.person[tags[0]]+"</td></tr>"); }
			if (this.number[tags[5]]) { t.append("<tr><th>Number</th><td>"+ this.number[tags[5]]+"</td></tr>"); }

			if (this.tense[tags[1]]) { t.append("<tr><th>Tense</th><td>"+ this.tense[tags[1]]+"</td></tr>"); }
			if (this.voice[tags[2]]) { t.append("<tr><th>Voice</th><td>"+ this.voice[tags[2]]+"</td></tr>"); }
			if (this.mood[tags[3]]) { t.append("<tr><th>Mood</th><td>"+ this.mood[tags[3]]+"</td></tr>"); }
			if (this.case[tags[4]]) { t.append("<tr><th>Case</th><td>"+ this.case[tags[4]]+"</td></tr>"); }
		}
		if (w.attr("lemma")) {t.append("<tr><th>Lemma</th><td>"+w.attr("lemma")+"</td></tr>")}
		return t;
	}
};
"use strict";
const assert = require("node:assert/strict");
global.BS_TIBETAN_DATA = { voicelessSonorantRewrite: { "甲": "k-ma" }, specialNormalization: {} };
const c = require("../converter/converter.js");

const cases = [
  ["pa", "པ", "pa"], ["pʰi", "ཕི", "pʰi"], ["qʰˤrik", "ཆྼིག", "qʰˤrik"],
  ["pas", "པས", "pas"],
  ["s-rut", "སྲུད", "srut"], ["srut", "སྲུད", "srut"],
  ["m-s-rəʔ", "མྶྲྀའ", "m-srəʔ"], ["Cə.pAŋʔ-s", "འྀཔཱངའས", "Cə.pAŋʔ-s"],
  ["kət.gˤʷawk", "ཀྟྀགྱྭཝག", "kət.gˤʷawk"], ["m-s-ka", "མསྐ", "m-s-ka"]
];
for (const [bs, tibetan, normalized] of cases) {
  assert.equal(c.bsSyllableToTibetan(bs), tibetan, bs);
  assert.equal(c.tibetanSyllableToBs(tibetan), normalized, tibetan);
  assert.equal(c.tibetanSyllableToBs(c.bsSyllableToTibetan(bs)), c.parseBsSyllable(bs).normalized);
}
assert.equal(c.normalizeNotation("*[b]ˤr[a]k"), "bˤrak");
assert.equal(c.bsSyllableToTibetan("*p(r)omʔ"), c.bsSyllableToTibetan("promʔ"));
assert.throws(() => c.parseBsSyllable("m̥a"), /清響音/);
const table = c.parseHanBsCsv("han,bs\n某,*məʔ\n");
assert.deepEqual(c.hanToTibetan("某。", table), { output: "མྀའ༎", bs: "məʔ。", errors: [] });
const rewritten = c.parseHanBsCsv("han,bs\n甲,m̥a\n");
assert.equal(rewritten.get("甲"), "k-ma");
assert.equal(c.hanToTibetan("甲", rewritten).output, "ཀྨ");
assert.equal(c.convertBsText("pa s-rut").output, "པ་སྲུད");
assert.equal(c.convertBsText("Cə.pa pa.").output, "འྀཔ་པ༎");

let exhaustive = 0;
for (const root of Object.keys(c.BASE)) for (const classKey of Object.keys(c.CLASS)) {
  for (const vowel of Object.keys(c.VOWEL)) for (const coda of Object.keys(c.CODA)) for (const post of Object.keys(c.POST)) {
    const slots = { minor: null, tight: [], root, class: { typeA: classKey[0] === "A", r: classKey[1] === "1", w: classKey[2] === "1" }, vowel, coda, post };
    assert.equal(c.tibetanSyllableToBs(c.encodeSlots(slots)), c.formatBs(slots));
    exhaustive += 1;
  }
}
console.log(`${cases.length} examples, ${exhaustive} exhaustive main-syllable round trips, and auxiliary checks passed.`);

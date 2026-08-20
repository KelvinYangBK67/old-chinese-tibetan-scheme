(function (root, factory) {
  const api = factory(root.BS_TIBETAN_DATA || {});
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BsTibetan = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (externalData) {
  "use strict";

  const BASE = Object.freeze({
    p: "པ", "pʰ": "ཕ", b: "བ", m: "མ",
    t: "ཏ", "tʰ": "ཐ", d: "ད", n: "ན",
    ts: "ཙ", "tsʰ": "ཚ", dz: "ཛ", s: "ས",
    k: "ཀ", "kʰ": "ཁ", g: "ག", ŋ: "ང",
    q: "ཅ", "qʰ": "ཆ", "ɢ": "ཇ", "ʔ": "ཨ",
    l: "ལ", r: "ར", C: "འ", N: "ཎ", S: "ཤ"
  });
  const SUBJOINED = Object.freeze(Object.fromEntries(
    Object.entries(BASE).map(([key, value]) => [key, String.fromCodePoint(value.codePointAt(0) + 0x50)])
  ));
  const FROM_BASE = new Map(Object.entries(BASE).map(([key, value]) => [value, key]));
  const FROM_SUBJOINED = new Map(Object.entries(SUBJOINED).map(([key, value]) => [value, key]));
  const CONSONANTS = Object.keys(BASE).sort((a, b) => b.length - a.length);

  const CLASS = Object.freeze({
    "B00": "", "B10": "ྲ", "B01": "ྭ", "B11": "ྲྭ",
    "A00": "ྱ", "A10": "ྼ", "A01": "ྱྭ", "A11": "ྼྭ"
  });
  const VOWEL = Object.freeze({ a: "", A: "ཱ", i: "ི", u: "ུ", e: "ེ", o: "ོ", "ə": "ྀ" });
  const MINOR_VOWEL = Object.freeze({ "": "྄", a: "ཱ", A: "ཱ", i: "ི", u: "ུ", e: "ེ", o: "ོ", "ə": "ྀ" });
  const CODA = Object.freeze({ "": "", j: "ཡ", w: "ཝ", r: "ར", m: "མ", n: "ན", ŋ: "ང", p: "བ", t: "ད", k: "ག", wk: "ཝག" });
  const POST = Object.freeze({ "": "", "ʔ": "འ", s: "ས", "ʔs": "འས" });
  const MINOR_FROM_MARK = new Map([["྄", ""], ["ྀ", "ə"], ["ཱ", "a"], ["ི", "i"], ["ུ", "u"], ["ེ", "e"], ["ོ", "o"]]);
  const VOWELS = new Set(Object.keys(VOWEL));
  const MARKUP = /[\[\]()<>]/gu;
  const QUOTES = new Set(["\"", "'", "“", "”", "‘", "’", "「", "」", "『", "』"]);

  class BsError extends Error {
    constructor(message, input = "") {
      super(message);
      this.name = "BsError";
      this.input = input;
    }
  }

  function firstAlternative(value) {
    return String(value).split("~", 1)[0].trim();
  }

  function normalizeNotation(value, contextKey = "") {
    let source = firstAlternative(value).normalize("NFC").trim();
    const rewrites = externalData.voicelessSonorantRewrite || {};
    const specials = externalData.specialNormalization || {};
    source = specials[contextKey] || specials[source] || source;
    source = rewrites[contextKey] || rewrites[source] || source;
    source = source.replace(/^\*+/u, "").replace(MARKUP, "").replace(/\s+/gu, "");
    source = source.replace(/ʰ/gu, "ʰ").replace(/ʷ/gu, "ʷ").replace(/ˤ/gu, "ˤ");
    if (/[mnlrŋ][̥̊]/u.test(source)) {
      throw new BsError("清響音須先由漢字或 row ID 的歷史來源表改寫", value);
    }
    return source;
  }

  function tokenizeConsonants(value, label) {
    const result = [];
    let cursor = 0;
    while (cursor < value.length) {
      const token = CONSONANTS.find(item => value.startsWith(item, cursor));
      if (!token) throw new BsError(`${label}含有不識別的輔音：${value.slice(cursor)}`, value);
      result.push(token);
      cursor += token.length;
    }
    return result;
  }

  function parseMinor(value) {
    let vowelIndex = -1;
    for (let index = 0; index < value.length; index += 1) {
      if (VOWELS.has(value[index])) { vowelIndex = index; break; }
    }
    let left = value;
    let right = "";
    let vowel = "";
    if (vowelIndex >= 0) {
      left = value.slice(0, vowelIndex);
      vowel = value[vowelIndex];
      right = value.slice(vowelIndex + 1);
    }
    const consonants = tokenizeConsonants(left + right, "minor syllable");
    if (consonants.length < 1 || consonants.length > 2) throw new BsError("minor syllable 須有一至兩個輔音", value);
    return { first: consonants[0], vowel, second: consonants[1] || "" };
  }

  function parseBsSyllable(raw, options = {}) {
    const normalized = normalizeNotation(raw, options.contextKey || "");
    if (!normalized) throw new BsError("空的 B–S 音節", raw);
    const dot = normalized.indexOf(".");
    if (dot !== normalized.lastIndexOf(".")) throw new BsError("一個音節至多有一個 minor boundary", raw);
    const minor = dot >= 0 ? parseMinor(normalized.slice(0, dot)) : null;
    let main = dot >= 0 ? normalized.slice(dot + 1) : normalized;

    let post = "";
    if (main.endsWith("ʔ-s")) { post = "ʔs"; main = main.slice(0, -3); }
    else if (main.endsWith("ʔs")) { post = "ʔs"; main = main.slice(0, -2); }
    else if (main.endsWith("-s")) { post = "s"; main = main.slice(0, -2); }
    else if (main.endsWith("ʔ")) { post = "ʔ"; main = main.slice(0, -1); }
    else if (main.endsWith("s")) { post = "s"; main = main.slice(0, -1); }

    let vowelIndex = -1;
    for (let index = 0; index < main.length; index += 1) {
      if (VOWELS.has(main[index])) { vowelIndex = index; break; }
    }
    if (vowelIndex < 0) throw new BsError("主音節缺少元音", raw);
    let onset = main.slice(0, vowelIndex);
    const vowel = main[vowelIndex];
    let tail = main.slice(vowelIndex + 1);
    let coda = "";
    for (const candidate of ["wk", "j", "w", "r", "m", "n", "ŋ", "p", "t", "k"]) {
      if (tail === candidate) { coda = candidate; tail = ""; break; }
    }
    if (tail) throw new BsError(`不識別的韻尾：${tail}`, raw);

    const typeA = onset.includes("ˤ");
    const wFeature = onset.includes("ʷ");
    onset = onset.replace(/ˤ/gu, "").replace(/ʷ/gu, "");
    const parts = onset.split("-").filter(Boolean);
    if (!parts.length) throw new BsError("主音節缺少聲母", raw);
    const consonants = parts.flatMap(part => tokenizeConsonants(part, "聲母"));
    let rFeature = false;
    if (consonants.length > 1 && consonants.at(-1) === "r") {
      consonants.pop();
      rFeature = true;
    }
    if (!consonants.length) throw new BsError("r-feature 前缺少 root", raw);
    const rootConsonant = consonants.pop();
    if (consonants.length > 2) throw new BsError("tight preinitial 至多兩個", raw);
    const slots = {
      minor,
      tight: consonants,
      root: rootConsonant,
      class: { typeA, r: rFeature, w: wFeature },
      vowel, coda, post
    };
    slots.normalized = formatBs(slots);
    return slots;
  }

  function formatMinor(minor) {
    return minor ? minor.first + minor.vowel + minor.second + "." : "";
  }

  function formatBs(slots) {
    const tight = slots.tight.length ? slots.tight.join("-") + "-" : "";
    const features = (slots.class.typeA ? "ˤ" : "") + (slots.class.r ? "r" : "") + (slots.class.w ? "ʷ" : "");
    const post = slots.post === "ʔs" ? "ʔ-s" : slots.post;
    return formatMinor(slots.minor) + tight + slots.root + features + slots.vowel + slots.coda + post;
  }

  function encodeMinor(minor) {
    if (!minor) return "";
    return BASE[minor.first] + (minor.second ? SUBJOINED[minor.second] : "") + MINOR_VOWEL[minor.vowel];
  }

  function encodeOnset(slots) {
    if (!slots.tight.length) return BASE[slots.root];
    if (slots.tight.length === 1) return BASE[slots.tight[0]] + SUBJOINED[slots.root];
    return BASE[slots.tight[0]] + BASE[slots.tight[1]] + SUBJOINED[slots.root];
  }

  function encodeSlots(slots) {
    const classKey = `${slots.class.typeA ? "A" : "B"}${slots.class.r ? 1 : 0}${slots.class.w ? 1 : 0}`;
    return encodeMinor(slots.minor) + encodeOnset(slots) + CLASS[classKey] + VOWEL[slots.vowel] + CODA[slots.coda] + POST[slots.post];
  }

  function bsSyllableToTibetan(raw, options = {}) {
    return encodeSlots(parseBsSyllable(raw, options));
  }

  function decodeMinorPrefix(value) {
    const chars = [...value];
    if (!FROM_BASE.has(chars[0])) return { minor: null, rest: value };
    let cursor = 1;
    let second = "";
    if (FROM_SUBJOINED.has(chars[cursor])) { second = FROM_SUBJOINED.get(chars[cursor]); cursor += 1; }
    if (!MINOR_FROM_MARK.has(chars[cursor])) return { minor: null, rest: value };
    const minor = { first: FROM_BASE.get(chars[0]), vowel: MINOR_FROM_MARK.get(chars[cursor]), second };
    return { minor, rest: chars.slice(cursor + 1).join("") };
  }

  function decodeOnset(value) {
    const chars = [...value];
    if (chars.length === 1 && FROM_BASE.has(chars[0])) return { tight: [], root: FROM_BASE.get(chars[0]) };
    if (chars.length === 2 && FROM_BASE.has(chars[0]) && FROM_SUBJOINED.has(chars[1])) {
      return { tight: [FROM_BASE.get(chars[0])], root: FROM_SUBJOINED.get(chars[1]) };
    }
    if (chars.length === 3 && FROM_BASE.has(chars[0]) && FROM_BASE.has(chars[1]) && FROM_SUBJOINED.has(chars[2])) {
      return { tight: [FROM_BASE.get(chars[0]), FROM_BASE.get(chars[1])], root: FROM_SUBJOINED.get(chars[2]) };
    }
    return null;
  }

  function sortedEntries(object) {
    return Object.entries(object).sort((a, b) => b[1].length - a[1].length);
  }

  function tibetanSyllableToSlots(raw) {
    const source = String(raw).normalize("NFC").replace(/^་+|་+$/gu, "").trim();
    if (!source) throw new BsError("空的藏文音節", raw);
    const candidates = [];
    for (const [post, postText] of sortedEntries(POST)) {
      if (!source.endsWith(postText)) continue;
      const afterPost = source.slice(0, source.length - postText.length || undefined);
      for (const [coda, codaText] of sortedEntries(CODA)) {
        if (!afterPost.endsWith(codaText)) continue;
        const afterCoda = afterPost.slice(0, afterPost.length - codaText.length || undefined);
        for (const [vowel, vowelText] of sortedEntries(VOWEL)) {
          if (!afterCoda.endsWith(vowelText)) continue;
          const afterVowel = afterCoda.slice(0, afterCoda.length - vowelText.length || undefined);
          for (const [classKey, classText] of sortedEntries(CLASS)) {
            if (!afterVowel.endsWith(classText)) continue;
            const body = afterVowel.slice(0, afterVowel.length - classText.length || undefined);
            const minorResult = decodeMinorPrefix(body);
            const onset = decodeOnset(minorResult.rest);
            if (!onset) continue;
            const slots = {
              minor: minorResult.minor,
              tight: onset.tight,
              root: onset.root,
              class: { typeA: classKey[0] === "A", r: classKey[1] === "1", w: classKey[2] === "1" },
              vowel, coda, post
            };
            if (encodeSlots(slots) === source) candidates.push(slots);
          }
        }
      }
    }
    if (!candidates.length) throw new BsError("不是本方案可辨認的規範藏文音節", raw);
    candidates.sort((a, b) => (b.post.length - a.post.length) || (b.coda.length - a.coda.length));
    return candidates[0];
  }

  function tibetanSyllableToBs(raw) {
    return formatBs(tibetanSyllableToSlots(raw));
  }

  function parseHanBsCsv(text) {
    const rows = String(text).replace(/^\uFEFF/u, "").split(/\r?\n/u);
    if ((rows.shift() || "").trim().toLowerCase() !== "han,bs") throw new BsError("漢字表須以 han,bs 為表頭");
    const map = new Map();
    for (const row of rows) {
      if (!row.trim() || row.trimStart().startsWith("#")) continue;
      const comma = row.indexOf(",");
      if (comma < 1) throw new BsError(`無效 CSV 資料列：${row}`);
      const han = row.slice(0, comma).trim();
      const bs = row.slice(comma + 1).trim();
      if ([...han].length !== 1 || !bs) throw new BsError(`無效漢字映射：${row}`);
      const canonical = parseBsSyllable(bs, { contextKey: han }).normalized;
      if (map.has(han) && map.get(han) !== canonical) throw new BsError(`${han} 有衝突映射`);
      map.set(han, canonical);
    }
    return map;
  }

  function punctuationToTibetan(value) {
    let output = "";
    for (const character of String(value)) {
      if (/\s/u.test(character) || QUOTES.has(character)) continue;
      if (/[.。?？!！]/u.test(character)) output += "༎ ";
      else if (/[,，;；:：、]/u.test(character)) output += "། ";
      else output += character;
    }
    return output;
  }

  function hanToBs(input, table) {
    if (!(table instanceof Map)) throw new BsError("漢字 B–S 表尚未載入");
    const output = [];
    const errors = [];
    for (const character of String(input)) {
      if (table.has(character)) output.push(table.get(character));
      else if (/\p{Script=Han}/u.test(character)) { output.push(character); errors.push(`${character}：字表未收錄`); }
      else if (/\s/u.test(character)) continue;
      else output.push(character);
    }
    return { output: output.join(" ").replace(/\s+([，。！？；：,.!?;:])/gu, "$1"), errors };
  }

  function hanToTibetan(input, table) {
    const bsResult = hanToBs(input, table);
    const converted = convertBsText(bsResult.output);
    return { output: converted.output, bs: bsResult.output, errors: [...bsResult.errors, ...converted.errors] };
  }

  function convertBsText(input) {
    /* ASCII dot can be a minor boundary, so it is only punctuation when the
       complete chunk is not a valid B–S syllable and a valid stem precedes it. */
    const parts = String(input).trim().split(/(\s+|[，。！？；：,!?;:])/u);
    const output = [];
    const errors = [];
    let previousSyllable = false;
    for (const part of parts) {
      if (!part || /^\s+$/u.test(part)) continue;
      if (/^[，。！？；：,.!?;:]$/u.test(part)) {
        output.push(punctuationToTibetan(part)); previousSyllable = false; continue;
      }
      try {
        const tibetan = bsSyllableToTibetan(part);
        if (previousSyllable) output.push("་");
        output.push(tibetan); previousSyllable = true;
      } catch (error) {
        if (/\.+$/u.test(part)) {
          const stem = part.replace(/\.+$/u, "");
          try {
            const tibetan = bsSyllableToTibetan(stem);
            if (previousSyllable) output.push("་");
            output.push(tibetan, punctuationToTibetan(part.slice(stem.length)));
            previousSyllable = false;
            continue;
          } catch (_) { /* Report the original, more useful parse error. */ }
        }
        if (previousSyllable) output.push(" ");
        output.push(part); previousSyllable = false;
        errors.push(`${part}：${error.message}`);
      }
    }
    return { output: output.join("").trim(), errors };
  }

  function convertTibetanText(input) {
    const parts = String(input).normalize("NFC").split(/(༎|།།|།|་|\s+)/u);
    const output = [];
    const errors = [];
    for (const part of parts) {
      if (!part || /^\s+$/u.test(part)) continue;
      if (part === "་") { output.push(" "); continue; }
      if (["༎", "།།", "།"].includes(part)) { output.push(part === "།" ? ", " : ". "); continue; }
      try { output.push(tibetanSyllableToBs(part)); }
      catch (error) { output.push(part); errors.push(`${part}：${error.message}`); }
    }
    return { output: output.join("").trim(), errors };
  }

  return Object.freeze({
    BsError, BASE, SUBJOINED, CLASS, VOWEL, CODA, POST,
    normalizeNotation, parseBsSyllable, formatBs, encodeSlots,
    bsSyllableToTibetan, tibetanSyllableToSlots, tibetanSyllableToBs,
    parseHanBsCsv, hanToBs, hanToTibetan, convertBsText, convertTibetanText
  });
});

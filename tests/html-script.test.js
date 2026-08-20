"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

for (const relative of [
  "converter/index.html",
  "上古漢語藏文轉寫方案.html",
  "上古漢語藏文轉寫方案-en.html"
]) {
  const file = path.join(__dirname, "..", relative);
  const html = fs.readFileSync(file, "utf8");
  assert.match(html, /<meta charset="utf-8">/u, relative);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/gu)) {
    const target = match[1].split(/[?#]/u, 1)[0];
    if (!target || target.startsWith("#") || /^[a-z]+:/iu.test(target)) continue;
    assert.ok(fs.existsSync(path.resolve(path.dirname(file), decodeURIComponent(target))), `${relative}: missing ${target}`);
  }
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gu)) {
    if (match[1].trim()) assert.doesNotThrow(() => new Function(match[1]), relative);
  }
}

const readme = fs.readFileSync(path.join(__dirname, "..", "README.md"), "utf8");
for (const page of [
  "%E4%B8%8A%E5%8F%A4%E6%BC%A2%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88.html",
  "%E4%B8%8A%E5%8F%A4%E6%BC%A2%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88-en.html",
  "converter/"
]) {
  assert.ok(readme.includes(`https://kelvinyangbk67.github.io/old-chinese-tibetan-scheme/${page}`), `README: missing Pages link for ${page}`);
}

console.log("HTML metadata, inline scripts, and README Pages links passed.");

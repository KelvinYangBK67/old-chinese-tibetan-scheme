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

console.log("HTML metadata and inline scripts passed.");

# 上古漢語藏文轉寫方案 / Old Chinese Tibetan Transcription Scheme

## 轉寫方案 / Transcription scheme

本方案依 Baxter–Sagart 上古漢語擬音的音節結構，使用藏文 Unicode 拼寫上古漢語。轉寫以 slot tuple 為唯一中間格式，滿足：

```text
decode(encode(BS)) = normalize(BS)
```

- [閱讀中文網頁版](上古漢語藏文轉寫方案.html)
- [Read the English web edition](上古漢語藏文轉寫方案-en.html)
- [使用漢字、B–S、藏文轉換器](converter/)

## 互轉工具 / Converter

- 漢字 → 藏文：先由靜態 `han,bs` 表取得 canonical B–S，再進入共同藏文核心。
- B–S → 藏文：接受構擬星號、括號記號與以 `~` 分隔的 alternative。
- 藏文 → B–S：輸出 normalized B–S，不重建構擬記號。

附文未提供逐字 B–S 資料，因此 `converter/data/han-bs.csv` 初始只有表頭；未收錄字不作猜測。清響音及異常格式須在 `converter/data/rules.js` 以漢字或 row ID 為鍵明確改寫。

## 測試 / Tests

```sh
node tests/converter.test.js
```

## 授權 / License

方案文字與程式見 [LICENSE.md](LICENSE.md)。網頁字體沿用本專案 `fonts/` 所附 OFL 授權。

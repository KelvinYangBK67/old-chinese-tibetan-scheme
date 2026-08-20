# 上古漢語藏文轉寫方案 / Old Chinese Tibetan Transcription Scheme

## 轉寫方案 / Transcription scheme

本方案爲以藏文拼寫上古漢語之方案，以 Baxter–Sagart 擬音爲基礎，務求簡潔、自然。本方案以娛樂爲主。

- [閱讀中文網頁版](https://kelvinyangbk67.github.io/old-chinese-tibetan-scheme/%E4%B8%8A%E5%8F%A4%E6%BC%A2%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88.html)
- [Read the English web edition](https://kelvinyangbk67.github.io/old-chinese-tibetan-scheme/%E4%B8%8A%E5%8F%A4%E6%BC%A2%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88-en.html)
- [使用漢字、B–S、藏文轉換器](https://kelvinyangbk67.github.io/old-chinese-tibetan-scheme/converter/)

## 互轉工具 / Converter

- 漢字 → 藏文：收錄 Baxter–Sagart 表中 4,056 個字頭；多音字可逐字選擇讀音，再轉寫爲藏文。
- B–S → 藏文：接受構擬星號、括號記號與以 `~` 分隔的 alternative。
- 藏文 → B–S：輸出 normalized B–S，不重建構擬記號。

`converter/data/han-bs.csv` 整理自 [Baxter–Sagart Old Chinese reconstruction](https://sites.lsa.umich.edu/ocbaxtersagart/)；下載的原始工作簿不納入 repository。多音字選擇方式參考[切韻音系自動推導器](https://uliloewi.github.io/qieyun-autoderiver/)，候選項同時顯示 B–S 擬音、拼音、中古音和釋義。

## 測試 / Tests

```sh
node tests/converter.test.js
```

## 授權 / License

方案文字與程式見 [LICENSE.md](LICENSE.md)。網頁字體沿用本專案 `fonts/` 所附 OFL 授權。

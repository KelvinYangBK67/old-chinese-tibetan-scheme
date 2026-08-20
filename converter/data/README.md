# 轉換資料

## `han-bs.csv`

本表整理自 Baxter 與 Sagart 公布的 [Old Chinese reconstruction, version 1.1](https://sites.lsa.umich.edu/ocbaxtersagart/)，收錄字頭、B–S 擬音、拼音、中古音和英文釋義。原始 Excel 不納入 repository。

同一字頭可有多列。轉換器遇到不同擬音時會顯示候選項，由使用者按上下文自行選擇；相同擬音的釋義則合併顯示。

## `rules.js`

- `voicelessSonorantRewrite`：按漢字、詞義或資料 row ID 將清響音改寫為有歷史依據的完整 B–S。
- `specialNormalization`：收錄極少數原始資料格式異常。

兩表都不得對 `m̥ n̥ ŋ̊ l̥ r̥` 作字符級全局替換。

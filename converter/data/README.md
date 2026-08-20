# 轉換資料

## `han-bs.csv`

UTF-8 CSV，表頭固定為：

```csv
han,bs
```

每列只接受一個漢字及一個完整 B–S 音節。載入時會立即正規化；同一漢字若有互相衝突的映射則拒絕整張表。附文沒有提供逐字讀音資料，因此本表預設為空，不作猜測。

## `rules.js`

- `voicelessSonorantRewrite`：按漢字、詞義或資料 row ID 將清響音改寫為有歷史依據的完整 B–S。
- `specialNormalization`：收錄極少數原始資料格式異常。

兩表都不得對 `m̥ n̥ ŋ̊ l̥ r̥` 作字符級全局替換。


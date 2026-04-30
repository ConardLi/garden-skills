# gpt-image2-website：以 OpenCLI / Playwright CLI 取代 API Key 直接呼叫的執行計劃

## 1. 目標與邊界
- 目標：不在本專案中直接配置或暴露 OpenAI API key，改為透過“瀏覽器自動化 + ChatGPT Web UI 對話”完成提示詞輸入、圖片生成、結果抓取與編輯迴圈。
- 邊界：僅替代“執行與互動層”，不改變現有靜態網站的資料組織方式（cases/templates/categories）。

## 2. 當前專案事實（來自 README）
- 專案是純前端靜態站，當前強調“零後端 / 零 API”。
- 資料由 `scripts/build-data.mjs` 在構建期彙總到 `src/data/cases.json` 與 `src/data/docs.json`。
- 案例內容以 `public/case/**` + `_mapping.json` 組織，開發期支援監聽並熱更新。

## 3. 你本地端先更新最新文件（GitHub pull 命令）
以下命令專門給你本地路徑：

```bash
/Users/christianwu/garden-skills/dist/gpt-image2-website

git remote -v
git fetch --all --prune
git checkout main
# 若預設分支不是 main，改成實際分支名稱

git pull --rebase origin main

git log --oneline -n 5
git status
```

如果你只想快速同步（不管本地改動，直接覆蓋）：

```bash
/Users/christianwu/garden-skills/dist/gpt-image2-website
git fetch origin

git reset --hard origin/main
```

## 4. 建議架構（分層）

### 4.1 Adapter 層（新增）
統一定義 `ImageGenerationAdapter` 介面：
- `createSession()`：初始化執行會話（browser context + auth 狀態）
- `generate(prompt, options)`：向 ChatGPT Web UI 發起生圖請求
- `edit(image, prompt)`：在現有對話中繼續編輯
- `waitForResult()`：等待圖片產出與狀態穩定
- `exportAssets()`：下載/截圖並返回本地路徑

透過環境變數切換：
- `ADAPTER=opencli`
- `ADAPTER=playwright`

### 4.2 Runner 層（CLI 工作流）
新增 `scripts/automation/`：
- `run-single.mjs`：單案例除錯
- `run-batch.mjs`：讀取待執行清單（模板 + prompt）批次執行
- `persist-result.mjs`：將結果寫回 `public/case/<cat>/<tpl>/`
- `doctor.mjs`：檢測 OPENCLI / PLAYWRIGHT 可執行路徑與登入態檔案

### 4.3 資料回寫層
- 按專案既有約定寫入 `<n>.png` 與 `<n>.json/.txt`
- 自動維護 `_mapping.json`（若新增 case）
- 觸發現有 `build-data` 流程生成最新 `cases.json`

## 5. 本地可執行指令碼與工具路徑保障計劃

## 5.1 目錄與配置
建議新增：

```text
scripts/automation/
  doctor.mjs
  run-single.mjs
  run-batch.mjs
  persist-result.mjs
  adapters/
    opencli-adapter.mjs
    playwright-adapter.mjs
config/
  automation.local.json
```

`config/automation.local.json`（示例）：

```json
{
  "adapter": "opencli",
  "opencliPath": "/usr/local/bin/opencli",
  "playwrightPath": "/usr/local/bin/playwright",
  "chatgptUrl": "https://chatgpt.com/",
  "browserUserDataDir": "~/.cache/gpt-web-profile",
  "outputRoot": "public/case"
}
```

## 5.2 工具路徑檢查（doctor）
`doctor.mjs` 必做：
1. 校驗命令存在：
   - `which opencli`
   - `which playwright`
2. 校驗版本：
   - `opencli --version`
   - `playwright --version`
3. 校驗目錄可寫：
   - `public/case/`
4. 校驗登入態儲存位置是否存在（若策略要求）
5. 輸出明確錯誤碼（如 `E_TOOL_NOT_FOUND`, `E_AUTH_MISSING`）

## 5.3 NPM scripts（建議加入 package.json）

```json
{
  "scripts": {
    "auto:doctor": "node scripts/automation/doctor.mjs",
    "auto:single:opencli": "ADAPTER=opencli node scripts/automation/run-single.mjs",
    "auto:single:pw": "ADAPTER=playwright node scripts/automation/run-single.mjs",
    "auto:batch:opencli": "ADAPTER=opencli node scripts/automation/run-batch.mjs",
    "auto:batch:pw": "ADAPTER=playwright node scripts/automation/run-batch.mjs"
  }
}
```

## 5.4 本地執行順序（你可直接照跑）

```bash
/Users/christianwu/garden-skills/dist/gpt-image2-website

npm install
npm run auto:doctor

# 先跑單案例驗證
npm run auto:single:opencli
npm run auto:single:pw

# 再跑批次
npm run auto:batch:opencli
npm run auto:batch:pw

# 資料回寫後重建
npm run build:data
npm run dev
```

## 6. 兩種執行路徑

## 6.1 OpenCLI 路徑（優先）
適用：你希望以“命令式對話執行”快速串接提示詞。

步驟：
1. 在本機先完成 ChatGPT 登入態準備（瀏覽器 profile 或會話憑據）。
2. 由 OpenCLI 呼叫一組任務：開啟 ChatGPT Web、傳送 prompt、等待影象渲染完成、下載結果。
3. 指令碼接收結果並落盤到 `public/case/**`。
4. 執行 `npm run build:data` 或直接 `npm run dev` 驗證回寫。

關鍵控制點：
- 重試：請求失敗/超時時指數退避
- 冪等：同一 caseId 重跑不重複寫入
- 日誌：儲存會話日誌，便於追查 UI 改版導致的選擇器失效

## 6.2 Playwright CLI 路徑（穩定兜底）
適用：需要更精細的 UI 自動化、可視迴歸、穩定等待機制。

步驟：
1. 建立 Playwright 指令碼並使用持久化上下文（複用登入態）。
2. 對 ChatGPT 頁面建立“語義優先”定位策略（優先 role/text）。
3. 等待輸出區圖片節點出現並完成載入。
4. 優先下載原圖連結，失敗時退化為截圖。
5. 處理 rate limit / 網路異常並支援續跑。

## 7. 實施階段計劃（建議 4 周）
- Phase 0（1-2 天）：最小可行驗證（3 條 prompt）
- Phase 1（3-5 天）：抽象介面與 `run-single`
- Phase 2（5-7 天）：批處理與資料回寫
- Phase 3（3-5 天）：迴歸檢查、checkpoint、失敗重放

## 8. 風險與對策
- UI 變動：語義選擇器 + 冒煙測試
- 登入失效：持久化 profile + 健康檢查
- 速率限制：併發節流 + 指數退避
- 合規風險：操作日誌可審計，僅在合規範圍自動化

## 9. 驗收標準
- 單案例成功率 ≥ 95%（連續 20 次）
- 批次 50 條任務成功率 ≥ 90%（自動重試後）
- 回寫後 `npm run build` 可成功
- 新案例在前端檢索與詳情展示正常

## 10. 推薦決策
- 短期：OpenCLI 作為快速入口
- 中期：Playwright CLI 作為穩定主通道
- 最終：雙通道共用一套 Adapter + 回寫管線

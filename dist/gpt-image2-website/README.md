<div align="center">

# gpt-image-2-101

**一份用來"看完就會用" GPT‑Image‑2 的視覺化案例庫。**

161 條真實可複用的 prompt × 79 個結構化模板 × 17 個大類，配套生圖 Skill 與對話呼叫範例，用一個靜態網站全部呈現。

[![License: MIT](https://img.shields.io/badge/License-MIT-1F2937?style=flat-square)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Companion: garden-skills](https://img.shields.io/badge/Skill-garden--skills-0A6E96?style=flat-square)](https://github.com/ConardLi/garden-skills)

</div>

---

## 它是什麼

`gpt-image-2-101` 是一個**純前端、可靜態部署**的 GPT‑Image‑2 案例畫廊。它解決一個很具體的問題：

> "新模型出來了，我知道它能畫圖，但我不知道怎麼用它畫好圖。"

我們把"該寫什麼樣的 prompt"這件事拆成了 17 個大類、79 個可複用模板，每個模板配 1–3 條已經跑過、出圖效果穩定的真實案例。開啟任意一張圖，你能同時看到：

- 高畫質成品圖
- **完整原始 prompt**（一字不動可複製）
- 它屬於哪個 [Skill](https://github.com/ConardLi/garden-skills) 模板，模板原文是什麼
- 「如果用對話怎麼從零調出這張圖」的完整對話示例

它既是一份**學習材料**（看著就能學會怎麼寫 prompt），也是一份可以**直接 fork 當作"私人 prompt 庫"**的工程腳手架。

## 截圖

> 先放佔位。準備 3 張圖就夠了：Hero / 瀑布流 / 詳情頁。
>
> ```text
> docs/
> ├─ screenshot-hero.png
> ├─ screenshot-gallery.png
> └─ screenshot-detail.png
> ```

| Hero | Gallery (Masonry) | Case Detail |
| :--: | :--: | :--: |
| ![hero](./docs/screenshot-hero.png) | ![gallery](./docs/screenshot-gallery.png) | ![detail](./docs/screenshot-detail.png) |

## 特性

- **多圖浮動 Hero** — 14 張案例圖在背景錯落漂浮、隨機交叉淡入淡出，滑鼠驅動視差，遵守 `prefers-reduced-motion`。
- **兩種畫廊檢視** — Masonry 瀑布流 + 按 17 個分類聚合檢視，可按關鍵字 / 模板 / 格式篩選。
- **沉浸式案例詳情** — 左側大圖 + 同模板縮圖帶，右側三欄 Tab：成品 prompt、Skill 模板、對話用法。可鍵盤 ←/→ 翻頁。
- **零後端 / 零 API** — 全部資料在構建期編入 `cases.json`，可託管在 GitHub Pages / Vercel / Netlify / 任何靜態 CDN。
- **可貢獻的資料架構** — 加新案例只需要：丟圖 → 寫 JSON prompt → 改 `_mapping.json`，熱更新會自動重建索引。
- **生產級前端工程** — Vite 8 + React 19 + TypeScript 6，自定義 Vite 外掛、ESLint、嚴格 tsconfig，全程型別安全。
- **圖片節流** — `loading="lazy"` + `decoding="async"`，詳情頁主圖 `fetchpriority="high"`，避免一次性下載幾百 MB 流量。
- **打包硬化** — 自動排除 `public/` 中的 `.git`、`.DS_Store` 等噪聲目錄，避免跨平臺 `EPERM` 複製事故。

## 資料規模

| 專案 | 數量 | 說明 |
| --- | ---: | --- |
| Categories | 17 | UI / 產品 / 海報 / 人物 / 資訊圖 / 學術 / 技術架構圖 / 編輯工作流 / … |
| Templates | 79 | 每個模板對應 [garden-skills](https://github.com/ConardLi/garden-skills) 中的一個 Skill 子模組 |
| Cases | 161 | 每條都包含可直接餵給模型的 prompt + 真實出圖 |

數字來自當前倉庫的 `src/data/cases.json`，每次 `npm run build:data` 都會重新整理。

## 技術棧

| 層 | 選型 |
| --- | --- |
| 檢視框架 | React 19 + TypeScript 6 |
| 構建工具 | Vite 8（自定義 Plugin: `safePublicCopy`, `casesDataWatcher`）|
| 路由 | 自研 hash router (`src/lib/router.ts`)，使用 `history.pushState` 避免瀏覽器自動滾動 |
| 樣式 | CSS Custom Properties + 手寫動畫，無 UI 框架 |
| 字型 | `Instrument Serif` / `Plus Jakarta Sans` / `JetBrains Mono`（Google Fonts）|
| 資料 | 構建期由 `scripts/build-data.mjs` 把分散的 JSON / TXT / Markdown 聚合成兩個 manifest |
| Lint | ESLint 10 + typescript-eslint 8 |

## 快速開始

```bash
# 1. clone
git clone https://github.com/<your-org>/gpt-image-2-101.git
cd gpt-image-2-101

# 2. install
npm install

# 3. run dev (會先自動跑 build:data 生成 cases.json)
npm run dev
# http://localhost:5173

# 4. build for production
npm run build

# 5. preview production build
npm run preview
```

> **要求**：Node ≥ 18，建議 Node 20+。
>
> 專案已配置 `predev` / `prebuild` 鉤子，所以你不需要手動跑 `build:data`。開發期改 prompt / 加圖 / 改模板 MD 也會被監聽並自動重建。

## 專案結構

```
.
├─ public/
│  └─ case/                       # 真正的案例資產（PNG / JSON / TXT），按 category/template/idx 組織
│     ├─ _mapping.json            # 索引（哪些模板下有哪些案例）
│     └─ <category>/<template>/   # 每個模板一個目錄，1.json / 1.png / 2.json / 2.png …
├─ scripts/
│  └─ build-data.mjs              # 把 case + Skill 元資訊聚合成 cases.json / docs.json
├─ src/
│  ├─ components/
│  │  ├─ hero/                    # 大字 Hero、ModelCard 模型詳情卡
│  │  ├─ gallery/                 # 畫廊主體、瀑布流、分類檢視、詳情 Overlay
│  │  ├─ skills/                  # Skill 介紹頁（隱藏路由）
│  │  └─ shared/                  # Header / Footer
│  ├─ data/                       # 構建產物：cases.json / docs.json（不要手改）
│  ├─ lib/                        # router、data accessor
│  ├─ styles/                     # tokens.css 設計令牌 + globals.css
│  └─ types/                      # 全域性 TS 型別
├─ vite.config.ts                 # 自定義外掛：safePublicCopy、casesDataWatcher
└─ package.json
```

## 資料流水線

整個站點的"內容大腦"是 `scripts/build-data.mjs`，它把三個資料來源聚合成兩個客戶端 manifest：

```
public/case/_mapping.json                          ┐
public/case/<cat>/<tpl>/<idx>.{json|txt}           ├─►  src/data/cases.json
public/case/<cat>/<tpl>/<idx>.png                  │     └─ 161 cases × 79 templates × 17 categories
.claude/skills/gpt-image-2/references/<cat>/*.md   ┘

.claude/skills/gpt-image-2/SKILL.md                ┐
doc/img2.md                                        ├─►  src/data/docs.json
                                                   ┘     └─ Skill 介紹頁內容
```

**觸發時機**

| 時機 | 行為 |
| --- | --- |
| `npm run dev` / `npm run build` 之前 | `pre*` 鉤子自動跑 `build:data` |
| 開發期改動 `public/case/**` 或 `references/**/*.md` | `casesDataWatcher` Vite 外掛 250ms debounce 後增量重建，HMR 同步 |
| 手動觸發 | `npm run build:data` |

**生產構建時的複製策略**

我們用 `safePublicCopy` 接管了 Vite 預設的 `publicDir → dist` 複製，原因是 `public/case/` 是一份帶 `.git` 的 snapshot —— 預設 `cp -r` 會因 git pack 檔案的只讀許可權觸發 `EPERM`。這個外掛會按白名單過濾掉 `.git`、`.DS_Store`、`Thumbs.db` 等。

## 新增 / 修改一個案例

1. 選好分類與模板，比如 `product-visuals/lifestyle-product-scene`。
2. 在 `public/case/<category>/<template>/` 下放：
   - `<n>.json`（推薦）或 `<n>.txt`：完整 prompt
   - `<n>.png`：成品圖
3. 編輯 `public/case/_mapping.json`，把新案例追加到對應模板的 `cases` 陣列裡。
4. 如果引入了新模板：
   - 在 `.claude/skills/gpt-image-2/references/<category>/<template>.md` 寫模板說明
   - `_mapping.json` 中相應模板項的 `template_md` 指向它
5. 開發期儲存即可，Vite 會自動重建 `cases.json` 並熱更新頁面。

JSON 案例檔案期望欄位：

```json
{
  "title": "中文短標題",
  "brief": "一句話告訴讀者它在做什麼",
  "format": "png | jpg | webp"
}
```

> 實際可生效的欄位以 `scripts/build-data.mjs` 與 `src/types/index.ts` 為準。

## 效能 & 體驗細節

- **圖片懶載入**
  - 畫廊縮圖：`loading="lazy"` + `decoding="async"`
  - Hero 拼貼：前 4 張 `eager`，其餘 `lazy`
  - 詳情頁主圖：`eager` + `fetchpriority="high"`，開啟時優先搶頻寬
  - 詳情頁同模板縮圖條：`lazy`
- **滾動恢復**
  - 路由切換走 `history.pushState`，繞開瀏覽器空 hash 自動滾頂
  - 進入 / 關閉詳情 Overlay 時透過 `useRef` 精確儲存與還原 `scrollY`，並在下一幀二次校正
- **動畫與可訪問性**
  - Hero 入場：錯峰位移 + 縮放 + 模糊解除（`tileEnter` keyframes）
  - 案例圖輪播：隨機選位、避免重複，`@media (prefers-reduced-motion: reduce)` 全部關閉
- **構建產物**
  - JS / CSS 走 Vite 預設壓縮；圖片資產即時從 `dist/case/` 提供
  - 沒有 service worker、沒有執行時資料請求：開第一屏 = 一個 HTML + 一個 JS + 視口內的若干 PNG

## Roadmap

- [ ] 自動生成 `webp` 縮圖（多解析度 srcset）進一步節流
- [ ] 詳情頁"複製 prompt"一鍵命令 + 歷史瀏覽快取
- [ ] 站內全文搜尋（FlexSearch / lunr）
- [ ] 暗色模式 / 主題切換
- [ ] i18n（中文 / English 雙語切換）
- [ ] 與 `garden-skills` 自動同步（CI 拉取最新 Skill MD）
- [ ] 單測（Vitest）+ 視覺迴歸（Playwright + Storycap）

歡迎 PR / Issue 一起補完。

## 鳴謝

- 模板與 Skill 設計：[ConardLi/garden-skills](https://github.com/ConardLi/garden-skills)
- 字型：[Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) / [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) / [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- 靈感來源：OpenAI GPT‑Image‑2 系統報告與開發者社群裡的優秀 prompt 實踐

## License

[MIT](./LICENSE) © 2026 — 案例圖片由 GPT‑Image‑2 生成；prompt 文字與本專案原始碼以 MIT 協議開放使用。

> **使用說明**：本倉庫內的所有 prompt 文字和原始碼可在 MIT 協議下自由使用、修改與再發布；案例圖片僅作 GPT‑Image‑2 模型能力展示，請遵守 OpenAI 使用條款，避免用於侵權 / 誤導性 / 受限場景。

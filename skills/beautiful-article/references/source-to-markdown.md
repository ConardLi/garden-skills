# Source → Markdown

无论输入是什么，Phase 1 都先转成统一的 `source/source.md`，并把风险写进
`source/extraction-notes.md`。

## 产物

`source.md` 要包含：标题 · 来源 · 作者 / 时间 / 链接（若可得）· 正文 · 表格 ·
图片占位 · 代码块 · 引用 · 附录 / 脚注。

`extraction-notes.md` 要记录：输入类型 · 提取方式 · 可能丢失的信息 · PDF/DOCX 中
无法可靠还原的版式 · 图片 / 表格 / 脚注 / 代码是否完整 · 需要用户补充的素材或上下文 ·
**源语言、是否需要翻译、目标语言、翻译版文件名与翻译说明**。

## 语言与翻译

抽取后判断 `source.md` 的语言，并按 Phase 0 记录的目标语言决定：

- 未指定目标语言，或目标语言与源一致 → **不翻译**，最终文章语言 = 源语言。
- 指定了目标语言且与源不一致 → 产出 `source/source.<lang>.md`（如 `source.zh.md` / `source.en.md`），
  作为 Phase 2+ 的**事实底座**；原 `source.md` 保留备查。
  - 翻译要求：**地道、去翻译腔** —— 按目标语言的表达习惯重组句子，不逐字直译，不留生硬外语语序 /
    被动堆叠 / 异国标点；术语 / 数字 / 代码 / 公式 / 引用保持准确；标题层级、结构、信息保留比例不变。
  - 翻译只在源文层做一次；后续编辑、改写语气、组件化都基于翻译版进行。

## 不同输入的处理原则

| 输入 | 处理方式 | 自检重点 |
|---|---|---|
| URL | 抓网页正文，清理导航 / 广告 / 推荐 | 是否抓到主体，链接和图片是否保留 |
| PDF | 提取文本 / 章节 / 表格 / 图片占位 | 断行错乱、页眉页脚混入、表格丢失 |
| DOCX | 提取标题层级 / 段落 / 表格 / 图片占位 | 样式不重要，结构和内容完整性重要 |
| Markdown | 保持原有标题 / 代码块 / 表格 | 不要过度改写源文 |
| 纯文本 | 识别结构并标注不确定处 | 不要擅自编造层级 |
| 截图 / 图片 | 转成图片占位 + 说明，记录用途 | 记录到 extraction-notes，等用户确认 |

## 抽取脚本选择

Skill 提供两条抽取路径：MarkItDown 主路径 + 轻量 fallback。Agent 应在 Phase 1 先判断
输入类型、信息保留要求和本机环境，再选择脚本。

### 1. MarkItDown 主路径

对 PDF / DOCX / PPTX / HTML / 复杂文档，尤其是用户要求 80-100% 信息保留时，优先使用
`scripts/source-to-markdown-markitdown.py`：

```bash
python3.10 <path-to-beautiful-article>/scripts/source-to-markdown-markitdown.py <input> -o source/source.md
```

MarkItDown 需要 Python 3.10+。它是可选增强依赖，不随组件库或脚手架强制安装。
若未安装，按需提示用户安装：

```bash
python3.10 -m pip install "markitdown[pdf,docx]"
```

如果本机没有 `python3.10` 命令但有 `uv`，可临时拉起带 MarkItDown 的环境：

```bash
uv run --python 3.12 --with "markitdown[pdf,docx]" python \
  <path-to-beautiful-article>/scripts/source-to-markdown-markitdown.py <input> -o source/source.md
```

不要默认安装 `markitdown[all]`，除非用户明确需要 PPTX / XLSX / 音频 / YouTube / Azure 等
额外格式。全量安装更重，也更容易引入环境问题。

### 2. 轻量 fallback

如果 MarkItDown 不可用、Python 版本不足、转换失败，或输入只是 Markdown / TXT / 简单 HTML，
使用 `scripts/source-to-markdown.py`：

```bash
python3 <path-to-beautiful-article>/scripts/source-to-markdown.py <input> -o source/source.md
```

脚本会探测可用的解析库（pdfminer / pdfplumber / python-docx / BeautifulSoup），缺库时
打印安装建议并优雅降级。脚本只做**机械抽取**；正文清理、占位标注、风险记录仍由 agent 完成。
URL 也可直接用 agent 的网页抓取能力获取正文，再清理。

公开 URL 也可按需使用 [Parallel Search MCP 抽取脚本](parallel-search-mcp.md)：
无需 API key，抓取完整正文作为草稿；只有用户要求补充研究时才使用其搜索命令。
这是可选路径，抽取后仍须执行下方的五条自检并记录不确定项。

### 3. Agent 决策规则

- PDF / DOCX / PPTX / 复杂 HTML：先尝试 MarkItDown。
- Markdown / TXT：直接用 fallback，保持原文结构，不要过度处理。
- URL：可先用 Agent 的网页抓取能力获取正文；若已保存为 HTML 文件，再按复杂度选择
  MarkItDown 或 fallback。
- 100% 信息保留：抽取后必须更严格自检，必要时同时跑 MarkItDown 与 fallback，对比是否
  有表格、代码、脚注、图片占位遗漏。
- 任一脚本产物都只是 `source.md` 草稿；Agent 必须继续清理噪音、补图片占位，并写
  `source/extraction-notes.md`。

## Source Phase 自检（主 Agent 内联 · 5 条 checklist）

源材料质检**不是硬性 SubAgent 质检点**。主 Agent 进 Phase 2 前反正要通读 `source.md`，
就地按这 5 条核查、按结论修复即可（无需单独的 review 文件）：

1. **完整性**：是否被截断？体量是否和原文相称（长 PDF / 长文没有只抽到一半 / 只抓到首屏）？
2. **结构**：标题层级是否保留？还是被压平成一片正文（后面没法分章）？
3. **关键载体**：表格 / 代码 / 公式 / 引用 / 脚注是否保留且没损坏（表格没挤成一行、代码缩进还在、
   公式没变乱字符）？
4. **噪声**：是否误把导航 / 广告 / Cookie 横幅 / 推荐阅读 / 页眉页脚页码写进正文？编码有没有伤
   （乱码、连字 `ﬁ`、软连字符断词、两栏 PDF 阅读顺序错乱）？
5. **不确定项**：图片是否以占位标注？拿不准的都写进 `extraction-notes.md` 了吗？

> ⚠️ 上面 1/4 能孤读 markdown 抓到，但 **2/3 里"静默丢失"的表/段**（被悄悄删掉、吞掉）
> 光看 markdown 看不出来——必须对照 `original.*`。

## 升级为独立 Source Reviewer（仅限复杂/低置信源）

**只有**当 `extraction-notes.md` 标记了"低置信 / 复杂 PDF/DOCX / 转换吃不准 / 要求 100% 保留的关键源"
时，才升级为独立 SubAgent，并**强制对照原件做 diff 式核查**，写 `review/source-review.md`：

```text
请作为 Source Reviewer。同时读取 source/original.*（原件）和 source/source.md（转换产物）。
逐项做 diff 式核查：对照原件，source.md 是否漏掉了表格 / 段落 / 脚注 / 代码 / 图，
是否混入噪音，是否有结构塌陷或编码损坏。
只输出"按出现顺序的差异清单 + 必须修复项"，不评价文章好不好看，不要替我改文件。
```

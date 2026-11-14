# 可选：Parallel Search MCP 网页素材

Phase 1 处理公开 URL 时，可以按需使用
[Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp)。
匿名端点提供免费网页搜索（Fast 模式）和正文提取，无需账号或 API key，适合轻量使用，
有速率限制。原有 Agent 网页抓取、MarkItDown 和轻量 fallback 路径仍可使用。

## 安装与抓取

需要 [uv](https://docs.astral.sh/uv/getting-started/installation/) 和 Python 3.10+。
`uv run` 会按脚本内声明安装可选 `mcp>=1.26,<2` 依赖，不影响其他抽取脚本。
把 `<path-to-beautiful-article>` 换成安装后的 Skill 目录；在文章工作区运行：

```bash
uv run <path-to-beautiful-article>/scripts/source-to-markdown-parallel.py \
  fetch https://example.com -o source/source.md
```

脚本通过 Streamable HTTP 连接 `https://search.parallel.ai/mcp`，调用 `web_fetch`，
明确要求 `full_content: true`，把来源链接、标题、发布日期（若有）和正文写为 Markdown 草稿。
不会读取已保存的凭据或环境中的 API key。网络或提取失败返回非零退出码；只有成功获取
非空完整正文后才写输出文件，不会把搜索摘要当完整源文。服务警告输出到 stderr。

## 仅在用户要求补充研究时搜索

搜索不是无素材时替用户编文章的默认步骤。先遵守 Phase 0 的素材/大纲要求。
用户要求查证或补充来源时才运行 `search`，输出带 URL 和摘录的 JSON。
相关搜索和抓取使用同一个 `--session-id`（每篇文章生成一次；省略时每次命令生成新 ID）：

```bash
ARTICLE_SESSION_ID=$(python3 -c 'import uuid; print(uuid.uuid4())')
uv run <path-to-beautiful-article>/scripts/source-to-markdown-parallel.py \
  search --objective "Find the official Agent Skills format specification" \
  --query "Agent Skills format specification" \
  --session-id "$ARTICLE_SESSION_ID" -o source/research.json

# 审查搜索结果后，选择需要阅读的来源，再抓取完整正文。
uv run <path-to-beautiful-article>/scripts/source-to-markdown-parallel.py \
  fetch https://agentskills.io/specification \
  --session-id "$ARTICLE_SESSION_ID" -o source/skills-spec.md
```

`--query` 可重复使用；`search` 没有结果时返回非零退出码。省略 `-o` 会输出到 stdout。
这是一条脚本工具路径，不依赖模型 API，也不自动生成文章或驱动 Agent 循环。

## 抽取后仍要自检

`full_content` 是服务返回的正文，不保证原页面的信息无损。对照原页面检查截断、表格、
代码、脚注和图片；必要时保留原 HTML 并使用 MarkItDown / fallback 对比。
搜索摘录仅用于选源，不满足默认 100% 信息保留要求。

继续按 [Source → Markdown](source-to-markdown.md) 的五条 checklist 清理草稿，并在
`source/extraction-notes.md` 记录提取方式、来源、服务警告和不确定项；低置信源按原流程
升级独立 Source Reviewer。限流或抓取失败时停止该路径，按服务提示稍后重试，或使用
原有抽取路径；不要生成猜测的正文。

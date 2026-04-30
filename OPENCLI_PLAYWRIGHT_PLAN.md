# gpt-image2-website：以 OpenCLI / Playwright CLI 取代 API Key 直接调用的执行计划

## 1. 目标与边界
- 目标：不在本项目中直接配置或暴露 OpenAI API key，改为通过“浏览器自动化 + ChatGPT Web UI 对话”完成提示词输入、图片生成、结果抓取与编辑循环。
- 边界：仅替代“执行与交互层”，不改变现有静态网站的数据组织方式（cases/templates/categories）。

## 2. 当前项目事实（来自 README）
- 项目是纯前端静态站，当前强调“零后端 / 零 API”。
- 数据由 `scripts/build-data.mjs` 在构建期汇总到 `src/data/cases.json` 与 `src/data/docs.json`。
- 案例内容以 `public/case/**` + `_mapping.json` 组织，开发期支持监听并热更新。

## 3. 你本地端先更新最新文档（GitHub pull 命令）
以下命令专门给你本地路径：

```bash
cd /Users/christianwu/.config/skillshare/skills/report-to-web-pipeline/dist/gpt-image2-website

git remote -v
git fetch --all --prune
git checkout main
# 若默认分支不是 main，改成实际分支名称

git pull --rebase origin main

git log --oneline -n 5
git status
```

如果你只想快速同步（不管本地改动，直接覆盖）：

```bash
cd /Users/christianwu/.config/skillshare/skills/report-to-web-pipeline/dist/gpt-image2-website
git fetch origin

git reset --hard origin/main
```

## 4. 建议架构（分层）

### 4.1 Adapter 层（新增）
统一定义 `ImageGenerationAdapter` 接口：
- `createSession()`：初始化执行会话（browser context + auth 状态）
- `generate(prompt, options)`：向 ChatGPT Web UI 发起生图请求
- `edit(image, prompt)`：在现有对话中继续编辑
- `waitForResult()`：等待图片产出与状态稳定
- `exportAssets()`：下载/截图并返回本地路径

通过环境变量切换：
- `ADAPTER=opencli`
- `ADAPTER=playwright`

### 4.2 Runner 层（CLI 工作流）
新增 `scripts/automation/`：
- `run-single.mjs`：单案例调试
- `run-batch.mjs`：读取待执行清单（模板 + prompt）批量执行
- `persist-result.mjs`：将结果写回 `public/case/<cat>/<tpl>/`
- `doctor.mjs`：检测 OPENCLI / PLAYWRIGHT 可执行路径与登录态文件

### 4.3 数据回写层
- 按项目既有约定写入 `<n>.png` 与 `<n>.json/.txt`
- 自动维护 `_mapping.json`（若新增 case）
- 触发现有 `build-data` 流程生成最新 `cases.json`

## 5. 本地可执行脚本與工具路径保障计划

## 5.1 目录与配置
建议新增：

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

## 5.2 工具路径检查（doctor）
`doctor.mjs` 必做：
1. 校验命令存在：
   - `which opencli`
   - `which playwright`
2. 校验版本：
   - `opencli --version`
   - `playwright --version`
3. 校验目录可写：
   - `public/case/`
4. 校验登录态存储位置是否存在（若策略要求）
5. 输出明确错误码（如 `E_TOOL_NOT_FOUND`, `E_AUTH_MISSING`）

## 5.3 NPM scripts（建议加入 package.json）

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

## 5.4 本地执行顺序（你可直接照跑）

```bash
cd /Users/christianwu/.config/skillshare/skills/report-to-web-pipeline/dist/gpt-image2-website

npm install
npm run auto:doctor

# 先跑单案例验证
npm run auto:single:opencli
npm run auto:single:pw

# 再跑批次
npm run auto:batch:opencli
npm run auto:batch:pw

# 数据回写后重建
npm run build:data
npm run dev
```

## 6. 两种执行路径

## 6.1 OpenCLI 路径（优先）
适用：你希望以“命令式对话执行”快速串接提示词。

步骤：
1. 在本机先完成 ChatGPT 登录态准备（浏览器 profile 或会话凭据）。
2. 由 OpenCLI 调用一组任务：打开 ChatGPT Web、发送 prompt、等待图像渲染完成、下载结果。
3. 脚本接收结果并落盘到 `public/case/**`。
4. 运行 `npm run build:data` 或直接 `npm run dev` 验证回写。

关键控制点：
- 重试：请求失败/超时时指数退避
- 幂等：同一 caseId 重跑不重复写入
- 日志：保存会话日志，便于追查 UI 改版导致的选择器失效

## 6.2 Playwright CLI 路径（稳定兜底）
适用：需要更精细的 UI 自动化、可视回归、稳定等待机制。

步骤：
1. 建立 Playwright 脚本并使用持久化上下文（复用登录态）。
2. 对 ChatGPT 页面建立“语义优先”定位策略（优先 role/text）。
3. 等待输出区图片节点出现并完成加载。
4. 优先下载原图链接，失败时退化为截图。
5. 处理 rate limit / 网络异常并支持续跑。

## 7. 实施阶段计划（建议 4 周）
- Phase 0（1-2 天）：最小可行验证（3 条 prompt）
- Phase 1（3-5 天）：抽象接口与 `run-single`
- Phase 2（5-7 天）：批处理与数据回写
- Phase 3（3-5 天）：回归检查、checkpoint、失败重放

## 8. 风险与对策
- UI 变动：语义选择器 + 冒烟测试
- 登录失效：持久化 profile + 健康检查
- 速率限制：并发节流 + 指数退避
- 合规风险：操作日志可审计，仅在合规范围自动化

## 9. 验收标准
- 单案例成功率 ≥ 95%（连续 20 次）
- 批量 50 条任务成功率 ≥ 90%（自动重试后）
- 回写后 `npm run build` 可成功
- 新案例在前端检索与详情展示正常

## 10. 推荐决策
- 短期：OpenCLI 作为快速入口
- 中期：Playwright CLI 作为稳定主通道
- 最终：双通道共用一套 Adapter + 回写管线

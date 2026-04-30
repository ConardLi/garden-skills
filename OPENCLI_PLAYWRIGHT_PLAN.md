# gpt-image2-website：以 OpenCLI / Playwright CLI 取代 API Key 直接调用的执行计划

## 1. 目标与边界
- 目标：不在本项目中直接配置或暴露 OpenAI API key，改为通过“浏览器自动化 + ChatGPT Web UI 对话”完成提示词输入、图片生成、结果抓取与编辑循环。
- 边界：仅替代“执行与交互层”，不改变现有静态网站的数据组织方式（cases/templates/categories）。

## 2. 当前项目事实（来自 README）
- 项目是纯前端静态站，当前强调“零后端 / 零 API”。
- 数据由 `scripts/build-data.mjs` 在构建期汇总到 `src/data/cases.json` 与 `src/data/docs.json`。
- 案例内容以 `public/case/**` + `_mapping.json` 组织，开发期支持监听并热更新。

## 3. 建议架构（分层）

### 3.1 Adapter 层（新增）
统一定义 `ImageGenerationAdapter` 接口：
- `createSession()`：初始化执行会话（browser context + auth 状态）
- `generate(prompt, options)`：向 ChatGPT Web UI 发起生图请求
- `edit(image, prompt)`：在现有对话中继续编辑
- `waitForResult()`：等待图片产出与状态稳定
- `exportAssets()`：下载/截图并返回本地路径

通过环境变量切换：
- `ADAPTER=opencli`
- `ADAPTER=playwright`

### 3.2 Runner 层（CLI 工作流）
新增 `scripts/automation/`：
- `run-batch.mjs`：读取待执行清单（模板 + prompt）批量执行
- `run-single.mjs`：单案例调试
- `persist-result.mjs`：将结果写回 `public/case/<cat>/<tpl>/`

### 3.3 数据回写层
- 按项目既有约定写入 `<n>.png` 与 `<n>.json/.txt`
- 自动维护 `_mapping.json`（若新增 case）
- 触发现有 `build-data` 流程生成最新 `cases.json`

## 4. 两种执行路径

## 4.1 OpenCLI 路径（优先）
适用：你希望以“命令式对话执行”快速串接提示词。

步骤：
1. 在本机先完成 ChatGPT 登录态准备（浏览器 profile 或会话凭据）。
2. 由 OpenCLI 调用一组任务：
   - 打开 ChatGPT Web
   - 发送 prompt
   - 轮询等待图像渲染完成
   - 获取图片 URL 或直接触发下载
3. 脚本接收结果并落盘到 `public/case/**`。
4. 运行 `npm run build:data` 或直接 `npm run dev` 验证回写。

关键控制点：
- 重试：请求失败/超时时指数退避
- 幂等：同一 caseId 重跑不重复写入
- 日志：保存会话日志，便于追查 UI 改版导致的选择器失效

## 4.2 Playwright CLI 路径（稳定兜底）
适用：需要更精细的 UI 自动化、可视回归、稳定等待机制。

步骤：
1. 建立 `playwright` 脚本并使用持久化上下文（复用登录态）。
2. 对 ChatGPT 页面建立“语义优先”定位策略：
   - 优先 role/text 选择器
   - 最后才使用 brittle CSS selector
3. 关键等待条件：
   - 输入区可用
   - 发送按钮状态变化
   - 输出区出现图片节点并完成加载
4. 结果抓取：
   - 优先下载原图链接
   - 备选截图（命名规则对应 case）
5. 失败恢复：
   - 检测 rate limit、网络错误、页面刷新后续跑

## 5. 实施阶段计划（建议 4 周）

### Phase 0（1-2 天）：最小可行验证
- 选 3 条 prompt（简单/中等/复杂）
- 验证 OpenCLI 与 Playwright 都能跑通“发 prompt→拿图→保存”
- 输出成功率与平均耗时

### Phase 1（3-5 天）：抽象与脚本化
- 完成 Adapter 接口与两个 provider
- 加入统一日志、重试、超时与错误码
- 支持 `run-single`

### Phase 2（5-7 天）：批处理与数据回写
- 支持 `run-batch`
- 自动写入 `public/case/**` 与 `_mapping.json`
- 跑 `build-data` 并在本地站点验证

### Phase 3（3-5 天）：稳定性与治理
- 增加回归检查（抽样截图对比）
- 增加中断续跑（checkpoint）
- 增加失败队列重放

## 6. 风险与对策
- UI 变动风险：ChatGPT 页面 DOM 变化频繁
  - 对策：语义选择器 + 选择器版本化 + 冒烟测试
- 登录/会话失效
  - 对策：持久化 profile、每日健康检查、人工一键续登
- 速率限制
  - 对策：节流并发、任务队列、指数退避
- 合规风险
  - 对策：明确仅在合规范围使用自动化；操作日志可审计

## 7. 建议落地清单（可直接建任务）
1. `scripts/automation/adapters/opencli-adapter.mjs`
2. `scripts/automation/adapters/playwright-adapter.mjs`
3. `scripts/automation/run-single.mjs`
4. `scripts/automation/run-batch.mjs`
5. `scripts/automation/persist-result.mjs`
6. `scripts/automation/config.example.json`
7. `docs/automation-runbook.md`

## 8. 验收标准
- 单案例成功率 ≥ 95%（连续 20 次）
- 批量 50 条任务成功率 ≥ 90%（可自动重试后）
- 回写后 `npm run build` 可成功
- 新案例可在前端页面被检索与详情页正常展示

## 9. 推荐决策
- 短期：OpenCLI 作为快速执行入口（开发效率高）
- 中期：Playwright CLI 作为稳定生产通道（可观测、可回归）
- 最终：双通道并存，共用一套 Adapter 接口与数据回写管线

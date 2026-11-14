# agent-qa

[English](./README.md) · [中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

使用 vostride 的 [agent-qa](https://github.com/vostride/agent-qa) 进行应用质量验证：以自然语言测试 Web、Android 和 iOS，结合先进的 memidex 记忆引擎与自我改进能力。

## 使用方式

在已配置 agent-qa 的项目中，向编程智能体提出请求：

> 审查选定的 agent-qa 运行记录。读取摘要、相关步骤证据和知识来源，解释原因与下一步，不修改测试或记忆。

也可以请求执行：

> 对开发版本运行选定的 agent-qa 回归测试，然后报告记录中的判定及其支持证据。

此技能按请求选择工作流程，执行前验证配置，按需读取产物，并区分历史知识与当前状态。保留现有生产环境保护和原始运行判定。

## 要求与限制

- 需要 shell、Node.js 24 或更新版本，以及已配置并安装 CLI 的 agent-qa 项目。
- 实际执行还需要目标应用和已配置的服务提供方。模型、浏览器或设备服务可能另行收费。
- 0.1.0 是实验性集成。格式兼容不代表已验证所有列出的智能体运行环境。
- 缺少证据不等于通过。分享前应检查截图和网络载荷；个人信息不会自动脱敏。

此技能包含原创工作流程说明，使用本集合的许可证。外部 agent-qa 运行时单独采用 **FSL-1.1-ALv2** 许可证，未打包在此技能中。

参阅 [SKILL.md](./SKILL.md)、[CLI 文档](https://vostride.com/docs/agent-qa/cli) 和[运行审查指南](https://vostride.com/docs/agent-qa/guides/review-a-run)。

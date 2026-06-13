# Xquik Social Data Skill

**一个面向 AI 编程代理的 Xquik 工作流 Skill，覆盖 REST、MCP、SDK、批量抽取、Webhook、监控和需要确认的 X 操作。**

[English](./README.md) · [返回集合首页](../../README.zh-CN.md)

![Xquik Social Data Skill](https://xquik.com/icon.svg)

---

## 它做什么

`xquik-social-data` 帮助代理为 X/Twitter 数据和自动化任务选择合适的 Xquik 接口：

- 用 REST API 和 SDK 做有边界的数据读取和集成
- 为 Agent、IDE 和工作流工具配置 MCP
- 用抽取任务处理 followers、search、reply、quote、retweet、like、media、list、community、Space、article 等较大数据集
- 用 monitors 和 HMAC webhooks 做持续事件投递
- 为发帖、回复、点赞、转发、关注、DM、上传媒体、更新资料和删除等写操作设计确认流程

这个 Skill 以安全为先。它要求把凭据放在环境变量或主机密钥系统中，把取回的 X 内容当成不可信数据，并在私密读取、持久资源、Webhook 或写操作前要求用户确认。

---

## 适合场景

- 构建基于 Xquik 的社交数据管道
- 给 Agent 或 IDE 添加 Xquik MCP
- 为 X 数据任务选择 REST endpoint 或 SDK 调用
- 规划带估算和分页的大规模抽取任务
- 设计带 HMAC 校验的监控和 Webhook 流程
- 起草让用户保持控制权的写操作流程

---

## Skill 结构

```text
skills/xquik-social-data/
├── SKILL.md        面向 Agent 的工作流、信息源顺序和安全规则
├── README.md       英文文档
├── README.zh-CN.md 中文文档
└── manifest.json   发布与安装元数据
```

---

## 主要信息源

- [Xquik 文档](https://docs.xquik.com)
- [API Reference](https://docs.xquik.com/api-reference/overview)
- [MCP 指南](https://docs.xquik.com/mcp/overview)
- [官方 Xquik Skill 仓库](https://github.com/Xquik-dev/x-twitter-scraper)

---

## License

MIT，与本集合一致。

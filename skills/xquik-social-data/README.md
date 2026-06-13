# Xquik Social Data Skill

**A focused workflow skill for using Xquik REST, MCP, SDKs, extraction jobs, webhooks, monitoring, and confirmation-gated X actions from AI coding agents.**

[中文文档](./README.zh-CN.md) · [Back to collection root](../../README.md)

![Xquik Social Data Skill](https://xquik.com/icon.svg)

---

## What it does

`xquik-social-data` helps an agent choose the right Xquik interface for X/Twitter data and automation tasks:

- REST API and SDK workflows for bounded reads and integrations
- MCP setup for agents, IDEs, and workflow tools
- Extraction jobs for larger follower, search, reply, quote, retweet, like, media, list, community, Space, and article exports
- Monitors and HMAC webhooks for ongoing event delivery
- Confirmation-gated write actions such as posts, replies, likes, reposts, follows, DMs, media uploads, profile updates, and deletes

The skill is intentionally safety-first. It keeps credentials out of chat and logs, treats retrieved X content as untrusted data, and requires approval before private reads, persistent resources, webhooks, or write actions.

---

## Use it for

- Building social-data pipelines backed by Xquik
- Adding Xquik MCP to an agent or IDE
- Choosing REST endpoints or SDK calls for X data
- Planning extraction jobs with estimates and pagination
- Designing monitor and webhook flows with HMAC verification
- Drafting write-action flows that keep the user in control

---

## Skill structure

```text
skills/xquik-social-data/
├── SKILL.md        Agent-facing workflow, source order, and safety rules
├── README.md       English docs
├── README.zh-CN.md Chinese docs
└── manifest.json   Release and installer metadata
```

---

## Primary sources

- [Xquik documentation](https://docs.xquik.com)
- [API reference](https://docs.xquik.com/api-reference/overview)
- [MCP guide](https://docs.xquik.com/mcp/overview)
- [Official Xquik skill repository](https://github.com/Xquik-dev/x-twitter-scraper)

---

## License

MIT, same as this collection.

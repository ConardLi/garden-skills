# agent-qa

[English](./README.md) · [中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

Application QA with [agent-qa](https://github.com/vostride/agent-qa) from vostride: natural-language web, Android and iOS tests with advanced memidex memory and self-improvement.

## Use it

In a project with agent-qa already configured, ask your coding agent:

> Review the selected agent-qa run. Inspect its digest, relevant step evidence and knowledge provenance. Explain the cause and next step without changing tests or memory.

Or request execution:

> Run the selected agent-qa regression tests against our development build, then report their recorded verdicts and supporting evidence.

The skill selects the requested workflow, validates before execution, reads targeted artifacts and separates historical knowledge from current state. It preserves existing production protections and the original run verdict.

## Requirements and limits

- A shell, Node.js 24 or newer, and a configured agent-qa project with its installed CLI.
- Live execution also needs the target application and configured providers. Model, browser or device providers may charge separately.
- Version 0.1.0 is an experimental integration. Format compatibility does not certify live execution across every listed agent runtime.
- Missing evidence is not a pass. Screenshots and network payloads need review before sharing; personal data is not automatically masked.

This skill contains original workflow instructions under this collection's license. The external agent-qa runtime is licensed separately under **FSL-1.1-ALv2** and is not bundled here.

See [SKILL.md](./SKILL.md), the [CLI reference](https://vostride.com/docs/agent-qa/cli), and the [run-review guide](https://vostride.com/docs/agent-qa/guides/review-a-run).

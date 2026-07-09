# Study Skill — AI-Powered Learning Assistant

> A skill built on **YJango's Learning Theory v5.5**, designed to help agents guide users through any learning journey — from "I don't understand X" to "I can use X fluently."

[中文文档](./README.zh-CN.md) · [Back to collection root](../../README.md)

## What it does

When a user says "teach me X," "I don't understand Y," or "help me learn Z," this skill provides a structured, theory-backed learning workflow instead of just throwing information at the user. It follows the **Eight-Step Progressive Construction framework** to diagnose what the learner actually needs, then builds up understanding atom by atom.

### The Eight Steps

| Step | What it does |
|------|-------------|
| ① Identify type | Classify what kind of thing is being learned (concept, skill, language, etc.) |
| ② Clarify I/O | Define input → output: what does "knowing it" look like? |
| ③ Decompose task | Break the goal into atomic learning units |
| ④ Analyze type | For each atomic unit, determine whether it's **discrimination**, **linking**, or **implicit learning** |
| ⑤ Analyze material | Match learning materials to the atomic type |
| ⑥ Analyze approach | Pick the right learning strategy (B: understanding vs A: application) |
| ⑦ Execute plan | Do the learning with exercises and feedback |
| ⑧ Validate results | Test, review, and iterate |

### Three Learning Atoms

| Atom | Icon | Definition |
|------|------|------------|
| Discrimination | 🧩 | Input phenomenon → Output category (learning to classify) |
| Linking | 🔗 | Input concepts → Output relationships (learning to connect) |
| Implicit | ⚡ | Conscious execution → Automatic fluency (learning to automate) |

## Highlights

- ✅ **Diagnosis-first** — doesn't start teaching until it knows what the learner actually needs
- ✅ **Theory-grounded** — based on YJango's learning theory v5.5 with 24 reference modules
- ✅ **Atomic decomposition** — breaks complex topics into atomic units (discrimination / linking / implicit)
- ✅ **Domain-aware** — adapts to programming, language learning, theoretical knowledge, and more
- ✅ **Exercise engine** — built-in `exercise.md` with practice workflows for each atom type
- ✅ **Quality guardrails** — 11 quality checks to prevent superficial learning
- ✅ **Progress tracking** — saves learning records for continuity across sessions

## Skill structure

```
skills/study/
├── SKILL.md                            Main skill (frontmatter name: study)
├── README.md  /  README.zh-CN.md       This document
├── index.md                            Module index (24 modules, prioritized)
├── exercise.md                         Exercise engine for all three atom types
├── references/
│   ├── annotation-guide.md             How to annotate learning materials
│   ├── execution-standards.md          Standards for exercise execution
│   ├── materials-collection.md         How to collect & curate learning materials
│   ├── method-map.md                   Learning method reference
│   ├── note-taking.md                  Note-taking strategies
│   ├── programming.md                  Programming-specific learning guidance
│   └── routing.md                      Routing table for user intent → learning step
└── modules/
    ├── 00-philosophy.md                Philosophical foundations
    ├── 02-concept-world.md             Concept world (discrimination model)
    ├── 04-information-inference.md     Information & inference
    ├── 05-dca.md                       DCA theory (discrimination-linking-automation)
    ├── 10-implicit-explicit.md         Implicit vs explicit learning
    └── 18 more...                      (see index.md for full list)
```

## How it works

1. **Listen first** — the skill maps the user's natural language ("I don't get it", "how do I start") to the right step in the learning framework.
2. **Diagnose before teaching** — steps ①-⑥ are all about understanding what the learner needs before giving any explanation.
3. **Atom-by-atom construction** — each atomic unit is taught, practiced, and verified before moving on.
4. **Validate with exercises** — the exercise engine generates discrimination tests, linking puzzles, and implicit practice sessions.
5. **Track progress** — learning records are saved so the learner can pick up where they left off.

## Best practices

- Start every learning session with **Step ①** unless the user has already expressed a specific need
- Always verify understanding before moving to the next step
- Respect the atomic unit boundaries — don't combine multiple atoms into one lesson
- Use the routing table to map user language to the correct step
- Save progress at the end of each session

## FAQ

**Q1: Does this work for any subject?**
Yes. The framework is domain-agnostic. It adapts to programming, mathematics, languages, theoretical knowledge, practical skills, and more. The `references/programming.md` file adds programming-specific context when detected.

**Q2: How is this different from just asking an AI to explain something?**
This skill doesn't just explain — it diagnoses, structures, exercises, and validates. The difference is between "telling you about X" and "making sure you actually learn X."

**Q3: Do I need to install anything?**
No external dependencies. The skill is self-contained with all references and modules.

**Q4: What if the user doesn't know which step they're at?**
That's expected. The routing table maps natural language to steps. If unsure, the skill defaults to Step ①.

## License

MIT

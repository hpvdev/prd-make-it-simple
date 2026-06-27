# Subagents

Project-scoped subagents. One `.md` file per agent.

Frontmatter:

```yaml
---
name: agent-name
description: When to use this agent (one paragraph). The orchestrator reads this to decide when to dispatch.
tools: [Read, Grep, Bash]   # optional whitelist; omit = all tools
model: sonnet                # optional: opus | sonnet | haiku
---
```

Body is the agent's system prompt — instructions, constraints, output format.

Invoke via the `Agent` tool with `subagent_type: <name>`.

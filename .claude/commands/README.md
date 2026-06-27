# Slash Commands

One `.md` file per command. Invoke as `/<filename>` from chat.

Frontmatter (optional):

```yaml
---
description: One-line summary shown in autocomplete
argument-hint: "<usage hint>"
allowed-tools: [Bash, Read, Edit]
---
```

Body is the prompt template. Use `$ARGUMENTS` for user input.

Naming: kebab-case, action-oriented (`review-pr.md`, `gen-tests.md`).

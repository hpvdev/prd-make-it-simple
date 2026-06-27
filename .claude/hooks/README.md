# Hooks

Shell scripts triggered by Claude Code events. Hooks can block tool calls, inject context, or run side effects.

## Event subfolders (create as needed)

| Folder | Trigger | Can block? |
|---|---|---|
| `pre-tool-use/` | Before any tool call (Bash, Edit, Write, ...) | ✅ Yes |
| `post-tool-use/` | After a tool call completes | ❌ No |
| `user-prompt-submit/` | On every user prompt — can inject extra context | ✅ Yes |
| `session-start/` | When a session opens | ❌ No |
| `stop/` | When Claude finishes responding | ❌ No |

## Wiring

Hooks must be registered in `.claude/settings.json` under the `hooks` key with a matcher (e.g. `Bash`, `Edit`, `*`). Scripts must be executable (`chmod +x`).

## Conventions

- Read JSON event payload from stdin.
- Exit `0` = allow / no-op. Exit `2` = block (for blocking events) — stderr becomes the reason shown to Claude.
- Keep hooks <2s; move heavy work to CI.
- Never bypass hooks with `--no-verify`.

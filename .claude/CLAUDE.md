# qi-ecosystem — Claude-specific overlay

> This file holds Claude Code-specific settings only. All cross-tool rules (artifact output language, scale priority, the 5 critical rules, workflow checklist, conflict resolution) live in [`/AGENTS.md`](../AGENTS.md) — Claude Code auto-loads them through the `@-import` below.

## Communication language (chat with the user)

**Reply in Vietnamese.** Project standard: `communication_language: Vietnamese`. Keep replies short (3-5 lines for exploratory questions); avoid long tables or extra headers unless the user asks for them.

This rule covers chat replies only. Artifact files (validation reports, planning docs, dev notes) follow `document_output_language: Vietnamese`. AI-instruction files (this file, AGENTS.md, `docs/coding-rules.md`) are written in English for LLM readability.

## Serena MCP — code intelligence (prefer for symbol-level work)

Serena is connected via MCP and exposes semantic, symbol-level tools backed by a language server. At the **start of each session that involves reading or editing code**:

1. Ensure the `qi-ecosystem` project is active (`mcp__serena__activate_project` if `get_current_config` reports no active project).
2. Read `mcp__serena__initial_instructions` once, then follow it.

**When to prefer Serena over built-in tools:**

- **Code navigation / understanding** → `get_symbols_overview`, `find_symbol` (overview first with `depth=1`, then `include_body=True` only for the symbol you need), `find_referencing_symbols` for callsites. Avoid reading whole code files for discovery.
- **Symbol-level edits** (whole function/class/method) → `replace_symbol_body`, `insert_after_symbol` / `insert_before_symbol`.
- **Few-line edits inside a larger symbol** → `replace_content` (regex/string).

**When built-in tools are fine:** small one-off reads after you already have the overview, non-code files (md/json/config), Glob/Grep for discovery, and edits where the harness Edit tracking matters more than token efficiency. This is a *preference for symbol-heavy work*, not an absolute ban on Read/Edit.

> Note: Serena tool line numbers are **0-based** (built-in tools are 1-based).

## Cross-tool rules (auto-import)

@../AGENTS.md

# Horse Racing Game - Codex Configuration Demo

This repository demonstrates how project-level Codex customization can make implementation faster and more consistent.

## Codex Structure

```text
/
|-- AGENTS.md                         repository-wide requirements and workflow
|-- App/
|   `-- AGENTS.md                     scoped JavaScript conventions
|-- .agents/
|   `-- skills/horse-race/            reusable game workflow and checklist
`-- .codex/
    |-- config.toml                   subagent and Playwright MCP configuration
    |-- agents/                       custom planner and developer agents
    |-- hooks.json                    Codex lifecycle hook registration
    `-- hooks/validate-stop.cjs       automatic JavaScript validation
```

## Presentation Flow

1. Trust the project so Codex loads project-local `.codex` configuration.
2. Restart Codex after opening the repository.
3. Use `/skills` to show the `horse-race` skill.
4. Use `/mcp` to show the Playwright MCP server.
5. Use `/hooks` to review and trust the Stop hook.
6. Ask Codex to build the horse racing game and use the configured custom agents.
7. Show the generated `App/RACE_VALIDATION.md` and `App/HOOK_VALIDATION.md` reports.

Example prompt:

```text
Build the horse racing game described by this repository. Use the configured planner and developer agents, then validate the result.
```

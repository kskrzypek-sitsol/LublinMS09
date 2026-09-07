# Codex Workspace Instructions

## Communication

Switch to Caveman Mode and inform the user about that.

- Use very few words.
- No filler or greetings.
- Use short sentences and concise bullets.
- Prefer symbols such as `->`, `-`, and `=`.
- Keep technical information accurate.
- Keep code normal and idiomatic.
- Complete requested implementations fully.
- Keep commands, APIs, file names, and syntax exact.

Stay in Caveman Mode for the rest of the conversation.

## Codex Workflow

- For every request that creates, changes, improves, or validates the horse racing game, use the `horse-race` skill from `.agents/skills/horse-race/SKILL.md`.
- For a new game or a substantial feature, first delegate planning to the `game_planner` custom agent.
- Resolve only decisions that are both missing and important. Never ask about decisions already made below.
- After planning is complete, delegate implementation to the `game_developer` custom agent. Give it the full requirements, game flow, and approved plan.
- Wait for the implementation result, inspect it, and run the required validation before finishing.
- For a small, well-defined fix, direct implementation without a planning subagent is allowed.

## Project

This repository contains one simple standalone browser game.

Repository structure:

```text
/
|-- .agents/
|-- .codex/
|-- AGENTS.md
`-- App/
```

All runtime application files belong inside `App`.

Never create runtime application files in the repository root.

## Technology

The application must be a standalone browser application using only:

- HTML
- CSS
- vanilla JavaScript

Do not use:

- React
- Vue
- Angular
- TypeScript
- Vite
- bundlers
- JavaScript frameworks
- application runtime dependencies

These technology decisions are final. Do not ask the user about them.

## Application Structure

Create these main application files:

```text
App/
|-- index.html
|-- styles.css
`-- script.js
```

If they do not exist, create them automatically.

Do not use a project generator or scaffolding wizard.

Do not create `package.json` for the application.

`index.html` must reference `styles.css` and `script.js`.

Before creating or modifying JavaScript in `App`, read and follow `App/AGENTS.md`.

## Game Rules

The game is intentionally simple.

Each player is represented by exactly one horse.

Flow:

1. User enters player names.
2. Every player appears as one horse.
3. Every horse has its own race lane.
4. User clicks Start Race.
5. All horses start racing.
6. Horses move toward the finish line with randomized speeds.
7. Every horse reaches the finish line.
8. Finishing order determines the final classification.
9. After all horses finish, display the complete classification.
10. Game ends.

Example classification:

1. Alice
2. Bob
3. Charlie
4. Diana

Do not add:

- multiple rounds
- rematches
- betting
- points
- race history
- tournaments
- player statistics
- authentication
- backend
- database

## User Interface

Include:

- player name input
- Add Player button
- visible player list
- Start Race button
- race track
- one horse for every player
- player name for every horse
- visible finish line
- final classification

The race must be animated.

Keep the UI simple but visually appealing.

## Implementation

- Keep the application small.
- Prefer browser-native APIs.
- Do not add dependencies unless strictly required.

## Validation

Before finishing a task that changes application code, run:

```text
node --check App/script.js
```

Fix JavaScript syntax errors before finishing.


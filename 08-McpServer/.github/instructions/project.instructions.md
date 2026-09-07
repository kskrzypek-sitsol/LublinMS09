# Project

This repository contains one simple standalone browser game.

Repository structure:

/
.github/
.vscode/
App/

All application files belong inside `App`.

Never create application files in the repository root.

# Technology

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

These technology decisions are already made.

Do not ask the user about technology choices.

# Application Structure

Create exactly these main application files:

App/
index.html
styles.css
script.js

If they do not exist, create them automatically.

Do not use a project generator or scaffolding wizard.

Do not create package.json for the application.

`index.html` must reference:

- styles.css
- script.js

# Game Rules

The game is intentionally very simple.

Each player is represented by exactly one horse.

Flow:

1. User enters player names.
2. Every player appears as one horse.
3. Every horse has its own race lane.
4. User clicks Start Race.
5. All horses start racing.
6. Horses move toward the finish line with randomized speeds.
7. Every horse must reach the finish line.
8. Finishing order determines the final classification.
9. After all horses finish, display the complete classification.
10. Game ends.

Example classification:

1. Alice
2. Bob
3. Charlie
4. Diana

Do not add:

- multiple rounds,
- rematches,
- betting,
- points,
- race history,
- tournaments,
- player statistics,
- authentication,
- backend,
- database.

# User Interface

Include:

- player name input,
- Add Player button,
- visible player list,
- Start Race button,
- race track,
- one horse for every player,
- player name for every horse,
- visible finish line,
- final classification.

The race must be animated.

Keep the UI simple but visually appealing.

# Implementation

Keep the application small.

Prefer browser-native APIs.

Do not add dependencies unless they are strictly required.

# Validation

Before finishing run:

node --check App/script.js

Fix JavaScript syntax errors before finishing.

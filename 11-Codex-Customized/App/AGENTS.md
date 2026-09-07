# App JavaScript Instructions

These rules apply to application code under `App`.

## Mandatory Function Naming Convention

Every application function in `script.js` must start with the prefix `oscp`.

This applies to:

- function declarations
- functions assigned to variables
- event handlers
- DOM rendering functions
- race logic functions
- helper and validation functions
- animation functions

Correct:

```javascript
function oscpAddPlayer() {}

const oscpCalculateSpeed = () => {};

const oscpUpdateHorse = function () {};
```

Incorrect:

```javascript
function addPlayer() {}

const calculateSpeed = () => {};
```

Event handlers must reference OSCP-prefixed functions. Avoid anonymous handlers when a named handler is practical.

```javascript
startButton.addEventListener("click", oscpStartRace);
addPlayerButton.addEventListener("click", oscpAddPlayer);
```

## JavaScript Structure

Use modern vanilla JavaScript.

Prefer:

- `const` over `let` when reassignment is not required
- small functions and clear names
- `addEventListener`
- arrays and simple objects
- browser DOM APIs
- readable control flow

Keep race simulation logic separate from DOM rendering where practical.

Race logic handles horse progress, randomized movement, finish detection, and finishing order.

DOM logic handles players, horses, horse positions, and classification.

Avoid frameworks, TypeScript, unnecessary classes, inline JavaScript, excessive globals, duplication, and unnecessary abstractions.

## Mandatory Final Verification

Before completing a task that modifies `script.js`:

1. Inspect every function declared in `script.js`.
2. Verify every application function starts with `oscp`.
3. Rename non-compliant functions and all their references.
4. Verify event listeners use the renamed functions.
5. From the repository root, run `node --check App/script.js`.

Do not finish while an application function lacks the `oscp` prefix.


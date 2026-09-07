---
name: OSCP JavaScript Rules
description: JavaScript coding conventions for the horse racing application. All application functions must use the oscp prefix.
applyTo: "App/*.js"
---

# OSCP JavaScript Rules

These rules MUST be followed whenever creating or modifying `App/script.js`.

## Mandatory Function Naming Convention

Every application function MUST start with the prefix:

`oscp`

This rule applies to ALL functions, including:

- event handlers
- DOM rendering functions
- race logic functions
- helper functions
- validation functions
- animation functions

### Correct examples

    function oscpAddPlayer() {
    }

    function oscpRenderPlayers() {
    }

    function oscpStartRace() {
    }

    function oscpMoveHorse() {
    }

    function oscpFinishHorse() {
    }

    function oscpRenderClassification() {
    }

### Incorrect examples

    function addPlayer() {
    }

    function startRace() {
    }

    function renderClassification() {
    }

## Arrow Functions and Function Expressions

Arrow functions and function expressions MUST follow the same naming convention.

### Correct

    const oscpCalculateSpeed = () => {
    };

    const oscpUpdateHorse = function () {
    };

### Incorrect

    const calculateSpeed = () => {
    };

    const updateHorse = function () {
    };

## Event Handlers

Event handlers must reference OSCP-prefixed functions.

### Correct

    startButton.addEventListener("click", oscpStartRace);
    addPlayerButton.addEventListener("click", oscpAddPlayer);

Avoid anonymous event handlers when a named handler can be used.

### Prefer

    startButton.addEventListener("click", oscpStartRace);

### Avoid

    startButton.addEventListener("click", () => {
        // race logic
    });

# JavaScript Structure

Use modern vanilla JavaScript.

Prefer:

- `const` over `let` when reassignment is not required
- small functions
- clear function names
- `addEventListener`
- arrays and simple objects
- browser DOM APIs
- readable control flow

Keep race simulation logic separate from DOM rendering where practical.

Race logic should handle:

- horse progress
- randomized movement
- detecting finish
- finishing order

DOM logic should handle:

- displaying players
- rendering horses
- updating horse positions
- displaying classification

Avoid:

- frameworks
- TypeScript
- unnecessary classes
- inline JavaScript
- excessive global variables
- duplicated logic
- unnecessary abstractions

# Mandatory Final Verification

Before completing any task that modifies `App/script.js`:

1. Inspect every function declared in `App/script.js`.
2. Verify that every application function starts with `oscp`.
3. Rename every function that does not follow the convention.
4. Verify that all references and event listeners use the renamed functions.
5. Run:

   `node --check App/script.js`

Do not finish the task while any application function exists without the `oscp` prefix.

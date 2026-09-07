---
name: horse-race
description: Use this skill whenever creating, implementing, modifying, improving, or validating the horse racing game in this workspace.
---

# Horse Race Development Skill

Use this workflow whenever working on the horse racing game.

# Step 1 - Inspect Existing Application

Inspect:

- App/index.html
- App/styles.css
- App/script.js

Preserve the existing application unless a change is required.

Follow all applicable workspace and file-specific instructions.

# Step 2 - Verify Players

Each player must have:

- one name
- exactly one horse
- exactly one race lane

Every player must be visible on the race track.

# Step 3 - Verify Race Flow

The race must follow this exact flow:

1. User adds players.
2. Every player receives one horse.
3. User clicks Start Race.
4. Every horse starts moving.
5. Horses move at randomized speeds.
6. Horses reach the finish line independently.
7. Each horse is recorded exactly once in finishing order.
8. Race continues until every horse finishes.
9. Final classification is displayed.
10. Game ends.

Do not add:

- multiple rounds
- rematches
- points
- betting
- race history
- tournaments
- statistics

# Step 4 - Verify Finish Logic

The application must maintain finishing order.

Each player must be added to the finishing order exactly once.

Classification must not be displayed until every horse has finished.

Final classification must:

- contain every player
- contain every player exactly once
- start at position 1
- reflect actual finishing order

# Step 5 - Validate JavaScript

Run:

    node --check App/script.js

Fix JavaScript syntax errors before continuing.

# Step 6 - Create Code Validation Report

Create or replace:

    App/RACE_VALIDATION.md

Use this structure:

    # Horse Race Skill Validation

    Skill: horse-race

    ## Validation

    - [x] Multiple players can be added
    - [x] Every player has exactly one horse
    - [x] Every horse has exactly one lane
    - [x] Every horse starts the race
    - [x] Horses move with randomized speeds
    - [x] Every horse reaches the finish line
    - [x] Every player appears exactly once in classification
    - [x] Classification is displayed after all horses finish
    - [x] JavaScript syntax validation passed

    ## Result

    PASS

# Step 7 - Browser Verification

If Playwright MCP browser tools are available, browser verification is mandatory.

Start a temporary HTTP server:

    npx --yes http-server App -p 4173

Open:

    http://localhost:4173

Use Playwright MCP for all browser interactions.

# Step 8 - Add Test Players

Using the browser UI, add exactly these players:

- Alice
- Bob
- Charlie
- Diana

Verify:

- Alice is visible
- Bob is visible
- Charlie is visible
- Diana is visible
- exactly four horses are visible
- every player has exactly one horse

# Step 9 - Run Race

Using Playwright MCP, click the Start Race button.

Verify:

- every horse starts
- every horse moves toward the finish line

Wait until the race is completely finished.

Do not continue while horses are still racing.

# Step 10 - Verify Classification

After the race finishes, verify that final classification is visible.

The classification must:

- contain exactly four positions
- contain Alice exactly once
- contain Bob exactly once
- contain Charlie exactly once
- contain Diana exactly once
- start at position 1
- end at position 4

The finishing order itself can be random.

# Step 11 - Capture Browser Evidence

After final classification is visible:

1. Take a screenshot using Playwright MCP.
2. Use the MCP configured output directory.
3. Do not provide an explicit screenshot filename.

The screenshot must show the completed race and final classification.

# Step 12 - Failure Handling

If browser verification fails:

1. identify the problem
2. modify the application
3. reload the application
4. repeat the failed verification

Do not create a successful browser validation report while browser verification is failing.

# Step 13 - Create Browser Validation Report

After browser verification passes, create or replace:

    App/BROWSER_VALIDATION.md

Use this structure:

    # Horse Race Browser Validation

    Tool: Playwright MCP

    ## Test Players

    - Alice
    - Bob
    - Charlie
    - Diana

    ## Browser Verification

    - [x] Application opened in browser
    - [x] Alice was added through the UI
    - [x] Bob was added through the UI
    - [x] Charlie was added through the UI
    - [x] Diana was added through the UI
    - [x] Exactly four horses were visible
    - [x] Start Race was triggered through the UI
    - [x] All horses participated in the race
    - [x] All horses reached the finish line
    - [x] Final classification was displayed
    - [x] Classification contained exactly four players
    - [x] Every test player appeared exactly once
    - [x] Browser screenshot was captured

    ## Result

    PASS

The task is not complete until both files exist:

    App/RACE_VALIDATION.md
    App/BROWSER_VALIDATION.md

and both contain:

    PASS

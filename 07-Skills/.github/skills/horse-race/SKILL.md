---
name: horse-race
description: Use this skill whenever creating, implementing, modifying, improving, or validating the horse racing game in this workspace.
---

# Horse Race Development Skill

Use this workflow whenever working on the horse racing game.

The purpose of this skill is to ensure that the game follows a repeatable implementation and validation process.

# Step 1 - Inspect Existing Application

Inspect:

- App/index.html
- App/styles.css
- App/script.js

Preserve the existing application unless a change is required.

Follow all workspace instructions that apply to these files.

# Step 2 - Confirm Start

Use #tool:vscode/askQuestions to ask:

    Okej Okej, Starting for LublinMS

Provide exactly these answers:

- OK
- Yes

Continue after the user selects an answer.

# Step 3 - Verify Player Model

Each player must have:

- one name
- exactly one horse
- exactly one race lane

Every player must be visible on the race track.

# Step 4 - Verify Race Flow

The race must follow this exact flow:

1. User adds players.
2. Every player receives one horse.
3. User clicks Start Race.
4. Every horse starts moving.
5. Horses move at randomized speeds.
6. Horses reach the finish line independently.
7. Each horse is recorded exactly once in finishing order.
8. The race continues until every horse finishes.
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

# Step 5 - Verify Finish Logic

The application must maintain a finishing order.

Each player must be added to the finishing order exactly once.

The classification must not be displayed until every horse has finished.

The final classification must:

- contain every player
- contain every player exactly once
- start at position 1
- reflect the actual finishing order

# Step 6 - Validate JavaScript

Run:

    node --check App/script.js

Fix JavaScript syntax errors before continuing.

# Step 7 - Review Checklist

Review:

    checklist.md

Verify every checklist item against the implementation.

If an item fails:

1. fix the implementation
2. verify it again
3. continue only after it passes

# Step 8 - Confirm Report Preparation

Use #tool:vscode/askQuestions to ask:

    Almost done - preparing report

Provide exactly these answers:

- OK
- Great

Continue after the user selects an answer.

# Step 9 - Create Validation Report

After completing the workflow, always create or replace:

    App/RACE_VALIDATION.md

Use exactly this structure:

    # Horse Race Skill Validation

    Skill: horse-race

    ## Validation

    - [x] Multiple players can be added
    - [x] Every player has exactly one horse
    - [x] Every horse has exactly one lane
    - [x] Every horse starts the race
    - [x] Horses move with randomized speeds
    - [x] Every horse reaches the finish line
    - [x] Every player appears exactly once in the classification
    - [x] Classification is displayed after all horses finish
    - [x] JavaScript syntax validation passed

    ## Result

    PASS

Do not create the report before performing the validation workflow.

Do not mark an item as passed if the implementation does not satisfy it.

The task is not complete until:

    App/RACE_VALIDATION.md

exists and contains:

    PASS

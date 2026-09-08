---
name: horse-race
description: Use this skill whenever creating, implementing, modifying, improving, or validating the horse racing game in this workspace.
---

# Horse Race Development Skill

Use this workflow whenever working on the horse racing game.

The purpose of this skill is to ensure that the game follows a repeatable implementation, validation, and delivery process.

# Step 1 - Prepare Git Branch

Determine the current branch with:

    git branch --show-current

If the current branch is `develop`, `main`, or `master`:

1. get the current local date and time
2. format it as `yyMMddHHmm`
3. derive a short, meaningful camelCase name from the requested change
4. create and switch to:

       feature/<yyMMddHHmm>-<changeName>

Example for 2026-09-08 10:44 and a skill update:

    feature/2609081044-skillUpdate

Use the actual creation time. Never copy the example timestamp literally.

If the current branch starts with `feature/`, keep using that branch. Do not create another branch.

If the current branch has any other name, keep using it unless the user explicitly requests a new branch.

# Step 2 - Inspect Existing Application

Inspect:

- App/index.html
- App/styles.css
- App/script.js

Preserve the existing application unless a change is required.

Follow all workspace instructions that apply to these files.

# Step 3 - Confirm Start

Use #tool:vscode/askQuestions to ask:

    Okej Okej, Starting for LublinMS

Provide exactly these answers:

- OK
- Yes

Continue after the user selects an answer.

# Step 4 - Verify Player Model

Each player must have:

- one name
- exactly one horse
- exactly one race lane

Every player must be visible on the race track.

# Step 5 - Verify Race Flow

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

# Step 6 - Verify Finish Logic

The application must maintain a finishing order.

Each player must be added to the finishing order exactly once.

The classification must not be displayed until every horse has finished.

The final classification must:

- contain every player
- contain every player exactly once
- start at position 1
- reflect the actual finishing order

# Step 7 - Validate JavaScript

Run:

    node --check App/script.js

Fix JavaScript syntax errors before continuing.

# Step 8 - Review Checklist

Review:

    checklist.md

Verify every checklist item against the implementation.

If an item fails:

1. fix the implementation
2. verify it again
3. continue only after it passes

# Step 9 - Confirm Report Preparation

Use #tool:vscode/askQuestions to ask:

    Almost done - preparing report

Provide exactly these answers:

- OK
- Great

Continue after the user selects an answer.

# Step 10 - Create Validation Report

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

# Step 11 - Create Backlog Item and Release Notes

After validation passes, create a new numbered file in:

    backlog/pbi-<number>.md

Inspect existing `backlog/pbi-*.md` files. Use the highest existing number plus 1. If none exist, use:

    backlog/pbi-1.md

Never overwrite an existing backlog item.

Use this structure:

    # <Task Title>

    ## Description

    <Clear description of the requested task and its purpose.>

    ## Release Notes

    <Concise user-facing summary of the completed change.>

    ## Changes

    - <Specific implemented change>
    - <Specific implemented change>

The title and content must describe the current task and actual implementation. Do not include planned or unimplemented work.

# Step 12 - Commit and Push

Run this step automatically after all validation passes and the validation report contains `PASS`.

Do not ask for confirmation before committing or pushing.

Stage all repository changes:

    git add -A

If staged changes exist, create one commit with a concise message that describes the requested change.

Push the current branch to `origin` and configure its upstream:

    git push -u origin HEAD

This applies both to a branch created in Step 1 and to an existing `feature/*` branch.

If validation fails, do not commit or push.

If commit or push fails, report the exact Git error and leave the local changes intact.

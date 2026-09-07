---
name: horse-race
description: Use whenever creating, implementing, modifying, improving, reviewing, or validating the horse racing game in this repository. Do not use for unrelated repository maintenance.
---

# Horse Race Development Skill

Use this repeatable workflow for every horse racing game task.

## 1. Inspect Existing Application

Inspect when present:

- `App/index.html`
- `App/styles.css`
- `App/script.js`

Preserve existing behavior unless the requested change requires modifying it.

Follow the repository `AGENTS.md` and the scoped `App/AGENTS.md` instructions.

## 2. Verify Player Model

Each player must have one name, exactly one horse, and exactly one race lane.

Every player must be visible on the race track.

## 3. Verify Race Flow

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

Do not add multiple rounds, rematches, points, betting, history, tournaments, or statistics.

## 4. Verify Finish Logic

Maintain a finishing-order collection.

Add each player exactly once.

Do not display the classification until every horse finishes.

The final classification must contain every player exactly once, start at position 1, and reflect the actual finishing order.

## 5. Validate JavaScript

Run:

```text
node --check App/script.js
```

Fix syntax errors before continuing.

## 6. Review Checklist

Read `references/checklist.md` and verify every item against the implementation.

If an item fails, fix the implementation and verify it again.

## 7. Create Validation Report

After completing the checks, create or replace `App/RACE_VALIDATION.md` with exactly this structure:

```markdown
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
```

Do not create the report before validation. Never mark an unmet item as passed.

The task is incomplete until `App/RACE_VALIDATION.md` exists and contains `PASS`.


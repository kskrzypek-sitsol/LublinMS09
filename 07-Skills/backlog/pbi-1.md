# Add Release Notes to Horse Race Skill

## Description

Extend the horse-race skill workflow so every validated task produces a numbered backlog item containing the task title, description, release notes, and actual changes.

## Release Notes

The horse-race workflow now creates a new numbered backlog PBI document before committing and pushing completed work.

## Changes

- Added sequential `backlog/pbi-<number>.md` file creation after validation.
- Added a required template for the task title, description, release notes, and implemented changes.
- Prevented existing backlog items from being overwritten.
- Moved automatic commit and push to the final workflow step so the backlog item is included.
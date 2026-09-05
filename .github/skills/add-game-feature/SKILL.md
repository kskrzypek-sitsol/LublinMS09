---
name: add-game-feature
description: Adds or modifies gameplay features in the Horse Race application.
---

# Add game feature

When implementing a gameplay feature:

1. Analyze all existing game states.
2. Prepare a short implementation plan.
3. Prevent invalid state transitions.
4. Disable controls when they should not be available.
5. Clean up timers and animations.
6. Preserve existing gameplay.
7. Test two consecutive races.
8. Run lint and build.
9. Review the final diff.

For countdown features:

- Display `3`, `2`, `1`, and `GO!`.
- Do not move horses before `GO!`.
- Disable player controls during countdown.
- Prevent multiple countdowns.
- Clear all timers when restarting.

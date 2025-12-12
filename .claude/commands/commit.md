---
description: Apply Prettier, ESLint fixes, and create a git commit
---

You are helping the user commit their changes following the project's coding standards.

## Task

1. Check git status to see what files have changed
2. For all modified/new TypeScript files:
   - Run Prettier to format the code: `npx prettier --write <files>`
   - Run ESLint with auto-fix: `npx eslint --fix <files>`
3. Review the changes after formatting/linting
4. Create a git commit:
   - If the user provided a commit message as an argument, use it
   - If no message was provided, analyze the changes and generate an appropriate commit message following conventional commit format
5. Show the commit result

## Important Notes

- Follow the instructions in CLAUDE.md: Always apply Prettier and ESLint after work
- Use conventional commit format (feat:, fix:, refactor:, docs:, etc.)
- Include the Claude Code footer in the commit message
- DO NOT push to remote - only commit locally

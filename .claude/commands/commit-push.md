---
description: Apply Prettier, ESLint fixes, commit, and push to remote
---

You are helping the user commit and push their changes following the project's coding standards.

## Task

1. Execute the commit workflow:
   - Check git status to see what files have changed
   - For all modified/new TypeScript files:
     - Run Prettier to format the code: `npx prettier --write <files>`
     - Run ESLint with auto-fix: `npx eslint --fix <files>`
   - Review the changes after formatting/linting
   - Create a git commit:
     - If the user provided a commit message as an argument, use it
     - If no message was provided, analyze the changes and generate an appropriate commit message following conventional commit format

2. After successful commit:
   - Push the changes to the remote repository
   - Confirm the push was successful

## Important Notes

- Follow the instructions in CLAUDE.md: Always apply Prettier and ESLint after work
- Use conventional commit format (feat:, fix:, refactor:, docs:, etc.)
- Include the Claude Code footer in the commit message
- This command WILL push to remote - make sure changes are ready
- Check the current branch before pushing to avoid pushing to the wrong branch
